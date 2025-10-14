import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { Pedido, EstadoPedido } from '../../../Model/Pedido/pedido';
import { Subscription } from 'rxjs';

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
  private useExternalTiles = false;
  private tileProvider: 'osm' | 'carto' = 'osm';
  private tileErrorCount = 0;

  map?: L.Map;
  courierMarker?: L.Marker;
  restaurantMarker?: L.Marker;
  destinationMarker?: L.Marker;
  routePolyline?: L.Polyline;
  intervalId?: any;
  private fallbackOverlay?: L.ImageOverlay;

  // Simulación de ruta dentro de la ciudad (Bogotá)
  private simulatedPath: L.LatLngExpression[] = [
    [4.653, -74.057], // Restaurante
    [4.654, -74.058],
    [4.655, -74.059],
    [4.656, -74.06],
    [4.657, -74.061],
    [4.658, -74.062],
    [4.659, -74.063],
    [4.660, -74.064],
    [4.661, -74.065],
    [4.662, -74.066]  // Destino (aproximado)
  ];
  private cursor = 0;

  @ViewChild('orderMap') orderMapEl?: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    // Permitir activar tiles externos con ?tiles=on
    const tilesParam = (this.route.snapshot.queryParamMap.get('tiles') || '').toLowerCase();
    // Por defecto, mostrar mapa real con calles (tiles externos ON, proveedor OSM)
    if (!tilesParam) {
      this.useExternalTiles = true;
      this.tileProvider = 'osm';
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
      next: (p) => {
        this.pedido = p;
        this.isLoading = false;
        this.tryInit();
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
    }).setView([4.653, -74.057], 14);

    // Asegurar que el mapa calcule correctamente su tamaño al renderizar
    setTimeout(() => {
      try { this.map?.invalidateSize(); } catch {}
    }, 0);

    if (this.useExternalTiles) {
      // Selección de proveedor de tiles
      const isCarto = this.tileProvider === 'carto';
      const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const url = isCarto
        ? (isDev ? '/carto/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
        : (isDev ? '/osm/{z}/{x}/{y}.png' : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
      const attribution = isCarto
        ? '&copy; OpenStreetMap contributors &copy; CARTO'
        : '&copy; OpenStreetMap contributors';
      const tileLayer = L.tileLayer(url, {
        maxZoom: 19,
        detectRetina: true,
        crossOrigin: true,
        attribution
      } as any);
      tileLayer.addTo(this.map!);
      // Fallback automático si los tiles fallan repetidamente (entornos con red restringida)
      tileLayer.on('tileerror', () => {
        this.tileErrorCount++;
        if (this.tileErrorCount >= 4 && this.map && !this.fallbackOverlay) {
          try { tileLayer.remove(); } catch {}
          const bounds = this.map.getBounds();
          this.fallbackOverlay = L.imageOverlay('assets/map-fallback.svg', bounds, { opacity: 0.45 });
          this.fallbackOverlay.addTo(this.map);
        }
      });
    }

    const courierIcon = L.divIcon({ className: 'pin pin-courier', html: this.svgPin('#ff3b3b'), iconSize: [24, 36], iconAnchor: [12, 36] });
    const restaurantIcon = L.divIcon({ className: 'pin pin-restaurant', html: this.svgPin('#2d8cff'), iconSize: [24, 36], iconAnchor: [12, 36] });
    const destinationIcon = L.divIcon({ className: 'pin pin-destination', html: this.svgPin('#2ecc71'), iconSize: [24, 36], iconAnchor: [12, 36] });

    this.restaurantMarker = L.marker(this.simulatedPath[0], { icon: restaurantIcon }).addTo(this.map).bindPopup('Restaurante');
    this.destinationMarker = L.marker(this.simulatedPath[this.simulatedPath.length - 1], { icon: destinationIcon }).addTo(this.map).bindPopup('Destino');
    this.courierMarker = L.marker(this.simulatedPath[0], { icon: courierIcon }).addTo(this.map).bindPopup('Domiciliario');
  }

  private initRoute(): void {
    this.routePolyline = L.polyline(this.simulatedPath as any, { color: '#fbb5b5', weight: 4 });
    if (this.showRoute) {
      this.routePolyline.addTo(this.map!);
    }
    this.fitToRoute();
    if (!this.useExternalTiles && this.map) {
      const bounds = this.map.getBounds();
      this.fallbackOverlay = L.imageOverlay('assets/map-fallback.svg', bounds, { opacity: 0.45 });
      this.fallbackOverlay.addTo(this.map);
    }
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
    const totalSteps = this.simulatedPath.length - 1;
    this.progressPercent = Math.min(100, Math.round((this.cursor / totalSteps) * 100));
    const courierLatLng = this.courierMarker?.getLatLng();
    const dest = this.simulatedPath[this.simulatedPath.length - 1] as [number, number];
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