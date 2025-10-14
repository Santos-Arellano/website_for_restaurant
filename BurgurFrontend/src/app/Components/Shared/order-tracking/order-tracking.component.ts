import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { GeocodingService } from '../../../Service/Geo/geocoding.service';
import { Pedido, EstadoPedido } from '../../../Model/Pedido/pedido';
import { Subscription, firstValueFrom } from 'rxjs';
import { DEFAULT_DESTINATION, DEFAULT_TILE_PROVIDER, DEFAULT_USE_EXTERNAL_TILES, RESTAURANT_ORIGIN } from '../../../config';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  pedido: Pedido | null = null;
  isLoading = true;
  errorMessage = '';
  statusMessage = '';
  etaMinutes = 0;
  progressPercent = 0;
  private viewReady = false;
  private initialized = false;
  showRoute = true;
  private subs: Subscription[] = [];
  private animating = false;
  useExternalTiles = false;
  private tileProvider: 'osm' | 'carto' = DEFAULT_TILE_PROVIDER;
  private tileErrorCount = 0;
  private tileLayer?: L.TileLayer;
  tileStatusMessage = '';

  map?: L.Map;
  courierMarker?: L.Marker;
  restaurantMarker?: L.Marker;
  destinationMarker?: L.Marker;
  routePolyline?: L.Polyline;
  intervalId?: any;
  private fallbackOverlay?: L.ImageOverlay;

  // Simulación de ruta dentro de la ciudad (Bogotá)
  private simulatedPath: L.LatLngExpression[] = [
    [RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon],
    [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon]
  ];
  private cursor = 0;

  @ViewChild('orderMap', { static: false }) orderMapEl?: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private geocoding: GeocodingService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    // Permitir activar tiles externos con ?tiles=on
    const tilesParam = (this.route.snapshot.queryParamMap.get('tiles') || '').toLowerCase();
    // Por defecto, desactivar tiles externos para evitar errores en redes restringidas
    if (!tilesParam) {
      this.useExternalTiles = DEFAULT_USE_EXTERNAL_TILES;
      this.tileProvider = DEFAULT_TILE_PROVIDER;
    } else if (tilesParam === 'off' || tilesParam === 'false' || tilesParam === '0') {
      this.useExternalTiles = false;
    } else if (tilesParam === 'carto') {
      this.useExternalTiles = true;
      this.tileProvider = 'carto';
    } else {
      this.useExternalTiles = true;
      this.tileProvider = 'osm';
    }
    if (!id) {
      this.errorMessage = 'ID de pedido inválido';
      this.isLoading = false;
      return;
    }
    this.pedidoService.getPedidoById(id).subscribe({
      next: async (p) => {
        this.pedido = p;
        // Intentar usar direccionEntrega del pedido; si no, del cliente actual.
        const destinoTexto = (p?.direccionEntrega || '').trim() || (this.clienteService.getCurrentCliente()?.direccion || '').trim();
        const origen: [number, number] = [RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon];
        try {
          if (destinoTexto) {
            const coords = await firstValueFrom(this.geocoding.geocodeAddress(destinoTexto));
            const destino: [number, number] = coords ? [coords.lat, coords.lon] : [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon];
            this.simulatedPath = this.interpolatePath(origen, destino, 10);
          } else {
            // Sin dirección disponible, usar destino por defecto
            const destino: [number, number] = [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon];
            this.simulatedPath = this.interpolatePath(origen, destino, 10);
          }
        } catch (e) {
          console.warn('Fallo geocodificación, usando destino por defecto', e);
          const destino: [number, number] = [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon];
          this.simulatedPath = this.interpolatePath(origen, destino, 10);
        } finally {
          this.isLoading = false;
          this.tryInit();
        }
      },
      error: (err) => {
        console.error('Error cargando pedido:', err);
        this.errorMessage = 'No se pudo cargar el pedido. Mostrando ruta simulada';
        this.isLoading = false;
        this.tryInit();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryInit();
  }

  private tryInit(): void {
    if (this.initialized) return;
    if (!this.viewReady) return;
    if (this.isLoading) return;
    // Esperar a que Angular pinte el contenedor
    setTimeout(() => {
      if (!this.orderMapEl) return;
      this.initMap();
      this.initRoute();
      this.startLiveTracking();
      this.initialized = true;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subs.forEach(s => s.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (!this.orderMapEl) throw new Error('Map container not found');
    this.map = L.map(this.orderMapEl.nativeElement, {
      zoomControl: true,
      attributionControl: true
    }).setView([RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon], 14);

    // Asegurar que el mapa calcule correctamente su tamaño al renderizar
    setTimeout(() => {
      try { this.map?.invalidateSize(); } catch {}
    }, 0);

    this.applyTileMode();

    const courierIcon = L.divIcon({ className: 'pin pin-courier', html: this.svgPin('#ff3b3b'), iconSize: [24, 36], iconAnchor: [12, 36] });
    const restaurantIcon = L.divIcon({ className: 'pin pin-restaurant', html: this.svgPin('#2d8cff'), iconSize: [24, 36], iconAnchor: [12, 36] });
    const destinationIcon = L.divIcon({ className: 'pin pin-destination', html: this.svgPin('#2ecc71'), iconSize: [24, 36], iconAnchor: [12, 36] });

    const path: L.LatLngExpression[] = (Array.isArray(this.simulatedPath) && this.simulatedPath.length >= 1)
      ? (this.simulatedPath as L.LatLngExpression[])
      : [
          [RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon] as L.LatLngTuple,
          [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon] as L.LatLngTuple
        ];

    this.restaurantMarker = L.marker(path[0] as L.LatLngExpression, { icon: restaurantIcon }).addTo(this.map!).bindPopup('Restaurante');
    this.destinationMarker = L.marker(path[path.length - 1] as L.LatLngExpression, { icon: destinationIcon }).addTo(this.map!).bindPopup('Destino');
    this.courierMarker = L.marker(path[0] as L.LatLngExpression, { icon: courierIcon }).addTo(this.map!).bindPopup('Domiciliario');
  }

  private initRoute(): void {
    const pathForRoute: L.LatLngExpression[] = (Array.isArray(this.simulatedPath) && this.simulatedPath.length >= 2)
      ? (this.simulatedPath as L.LatLngExpression[])
      : [
          [RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon] as L.LatLngTuple,
          [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon] as L.LatLngTuple
        ];
    this.routePolyline = L.polyline(pathForRoute, { color: '#fbb5b5', weight: 4 });
    if (this.showRoute) {
      this.routePolyline.addTo(this.map!);
    }
    this.fitToRoute();
  }

  private startLiveTracking(): void {
    this.cursor = 0;
    this.statusMessage = 'Domiciliario en camino';
    const subEstado = this.pedido ? this.pedidoService.watchEstadoPedido(this.pedido.id, 4000).subscribe((estado) => {
      // Actualizar badge/estado
      if (this.pedido) this.pedido.estado = estado;
      if (estado === EstadoPedido.ENTREGADO) {
        this.statusMessage = 'Pedido entregado';
      }
    }) : undefined;
    if (subEstado) this.subs.push(subEstado);

    const subLoc = this.pedidoService.watchCourierLocationMock(1500).subscribe((pos) => {
      if (!this.courierMarker) return;
      const next = L.latLng(pos.lat, pos.lng);
      this.animateMarker(this.courierMarker!, next);
      this.cursor = pos.index + 1;
      this.computeProgressLive();
      if (pos.index >= (pos.total - 1)) {
        this.statusMessage = 'Pedido entregado';
      }
    });
    this.subs.push(subLoc);
  }

  private applyTileMode(): void {
    if (!this.map) return;
    // Limpiar capas anteriores
    if (this.tileLayer) {
      try { this.tileLayer.remove(); } catch {}
      this.tileLayer = undefined;
    }
    if (this.fallbackOverlay) {
      try { this.fallbackOverlay.remove(); } catch {}
      this.fallbackOverlay = undefined;
    }
    this.tileErrorCount = 0;
    this.tileStatusMessage = '';

    if (this.useExternalTiles) {
      this.tileLayer = this.createTileLayer();
      this.tileLayer.addTo(this.map!);
      this.tileLayer.on('tileerror', () => {
        this.tileErrorCount++;
        if (this.tileErrorCount >= 1) {
          this.tileStatusMessage = 'Problema de carga de tiles. Activando mapa simplificado.';
          this.addFallbackOverlay();
        }
      });
    } else {
      this.tileStatusMessage = 'Simplified map mode active.';
      this.addFallbackOverlay();
    }
  }

  private createTileLayer(): L.TileLayer {
    const isCarto = this.tileProvider === 'carto';
    const url = isCarto
      ? 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = isCarto
      ? '&copy; OpenStreetMap contributors &copy; CARTO'
      : '&copy; OpenStreetMap contributors';
    return L.tileLayer(url, {
      maxZoom: 19,
      detectRetina: false,
      // Siempre proveer subdomains para evitar errores internos que leen .length
      subdomains: isCarto ? 'abcd' : 'abc',
      attribution
    } as any);
  }

  private addFallbackOverlay(): void {
    if (!this.map) return;
    // Añadir un overlay simple que ocupe el área visible
    try {
      const bounds = this.map.getBounds();
      this.fallbackOverlay = L.imageOverlay('assets/map-fallback.svg', bounds, { opacity: 0.45 });
      this.fallbackOverlay.addTo(this.map);
      // Mantener el overlay actualizado al mover/zoomear
      this.map.on('moveend', () => {
        if (!this.map || !this.fallbackOverlay) return;
        try {
          const newBounds = this.map.getBounds();
          this.fallbackOverlay!.setBounds(newBounds);
        } catch {}
      });
    } catch {}
  }

  toggleTiles(): void {
    this.useExternalTiles = !this.useExternalTiles;
    this.applyTileMode();
  }

  private animateMarker(marker: L.Marker, to: L.LatLng, durationMs: number = 1000): void {
    const from = marker.getLatLng();
    const start = performance.now();
    this.animating = true;
    const step = (time: number) => {
      const t = Math.min(1, (time - start) / durationMs);
      const lat = from.lat + (to.lat - from.lat) * t;
      const lng = from.lng + (to.lng - from.lng) * t;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this.animating = false;
      }
    };
    requestAnimationFrame(step);
  }

  private computeProgressLive(): void {
    const validPath: [number, number][] = (Array.isArray(this.simulatedPath) && this.simulatedPath.length >= 2)
      ? (this.simulatedPath as [number, number][])
      : [
          [RESTAURANT_ORIGIN.lat, RESTAURANT_ORIGIN.lon],
          [DEFAULT_DESTINATION.lat, DEFAULT_DESTINATION.lon]
        ];
    const totalSteps = validPath.length - 1;
    this.progressPercent = Math.min(100, Math.round(totalSteps > 0 ? (this.cursor / totalSteps) * 100 : 0));
    const courierLatLng = this.courierMarker?.getLatLng();
    const dest = validPath[validPath.length - 1] as [number, number];
    if (courierLatLng) {
      const remainingKm = this.haversineDistance([courierLatLng.lat, courierLatLng.lng], dest);
      const avgSpeedKmPerMin = 0.5; // ~30 km/h -> 0.5 km/min
      this.etaMinutes = Math.max(1, Math.round(remainingKm / avgSpeedKmPerMin));
    } else {
      const remaining = Math.max(0, totalSteps - this.cursor);
      this.etaMinutes = remaining;
    }
  }

  private haversineDistance(a: [number, number], b: [number, number]): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  }

  // Interpolar una ruta simple de puntos entre origen y destino
  private interpolatePath(
    origen: [number, number],
    destino: [number, number],
    steps: number
  ): L.LatLngExpression[] {
    const path: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const lat = origen[0] + (destino[0] - origen[0]) * t;
      const lng = origen[1] + (destino[1] - origen[1]) * t;
      path.push([lat, lng]);
    }
    return path;
  }

  volver(): void {
    this.router.navigate(['/orders', this.pedido?.id || '']);
  }

  fitToRoute(): void {
    if (this.routePolyline && this.map) {
      this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });
      // Recalcular tamaño por si cambió el layout
      try { this.map.invalidateSize(); } catch {}
    }
  }

  recenterCourier(): void {
    if (this.courierMarker && this.map) {
      this.map.panTo(this.courierMarker.getLatLng());
    }
  }

  toggleRoute(): void {
    if (!this.map || !this.routePolyline) return;
    this.showRoute = !this.showRoute;
    if (this.showRoute) {
      this.routePolyline.addTo(this.map);
      this.fitToRoute();
    } else {
      this.routePolyline.remove();
    }
  }

  getEstadoBadgeClass(estado?: string): string {
    const e = (estado || '').toLowerCase();
    switch (e) {
      case 'pendiente':
        return 'estado-badge estado-pendiente';
      case 'en_preparacion':
        return 'estado-badge estado-preparacion';
      case 'confirmado':
        return 'estado-badge estado-confirmado';
      case 'listo':
        return 'estado-badge estado-listo';
      case 'en_camino':
        return 'estado-badge estado-camino';
      case 'entregado':
        return 'estado-badge estado-entregado';
      case 'cancelado':
        return 'estado-badge estado-cancelado';
      default:
        return 'estado-badge estado-default';
    }
  }

  private svgPin(color: string): string {
    return `
      <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 24 12 24s12-16.5 12-24C24 5.373 18.627 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="#fff"/>
      </svg>
    `;
  }
}