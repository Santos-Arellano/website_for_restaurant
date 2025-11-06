import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService } from '../../../Service/Pedido/pedido.service';
import { ProductoService } from '../../../Service/Producto/producto.service';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Producto } from '../../../Model/Producto/producto';
import { ProductoPedido, EstadoPedido } from '../../../Model/Pedido/pedido';
import { ToastService } from '../../Shared/toast/toast.service';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  timestamp: number;
}

@Component({
  selector: 'app-chatbot-widget',
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  inputText = '';
  isSending = false;
  productosCache: Producto[] = [];
  private carritoCount = 0;

  quickSuggestions = [
    { label: 'Ver menú', action: () => this.handleIntent('menu') },
    { label: 'Abrir carrito', action: () => this.handleIntent('carrito') },
    { label: 'Rastrear pedido', action: () => this.handleIntent('seguimiento') },
    { label: 'Promociones', action: () => this.handleIntent('promociones') },
    { label: 'Ayuda', action: () => this.showHelp() }
  ];

  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private toast: ToastService
  ) {
    this.bootstrap();
    // Suscribir cambios del carrito para ajustar sugerencias
    this.pedidoService.carrito$.subscribe(carrito => {
      this.carritoCount = (carrito || []).reduce((t, it) => t + (it.cantidad || 0), 0);
      this.refreshQuickSuggestions();
    });
  }

  private bootstrap(): void {
    const saved = localStorage.getItem('chatbotSession');
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
      } catch {}
    }
    if (this.messages.length === 0) {
      this.addBotMessage('¡Hola! Soy tu asistente de BurGur 🍔');
      this.addBotMessage('¿En qué puedo ayudarte hoy?');
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.addUserMessage(text);
    this.inputText = '';
    this.respondTo(text);
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  useSuggestion(action: () => void): void {
    action();
  }

  private addUserMessage(text: string): void {
    this.messages.push({ from: 'user', text, timestamp: Date.now() });
    this.persist();
    this.scrollToBottomSoon();
  }

  private addBotMessage(text: string): void {
    this.messages.push({ from: 'bot', text, timestamp: Date.now() });
    this.persist();
    this.scrollToBottomSoon();
  }

  private persist(): void {
    localStorage.setItem('chatbotSession', JSON.stringify(this.messages));
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-body');
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  private handleIntent(intent: 'menu' | 'horario' | 'ubicacion' | 'promociones' | 'carrito' | 'carrito_ver' | 'carrito_vaciar' | 'pedido_finalizar' | 'seguimiento' | 'whatsapp'): void {
    switch (intent) {
      case 'menu':
        this.addBotMessage('Te llevo al menú. ¡Buen provecho!');
        this.router.navigate(['/menu']);
        break;
      case 'horario':
        this.addBotMessage('Nuestro horario es de Lunes a Domingo, 11:00–22:00.');
        break;
      case 'ubicacion':
        this.addBotMessage('Estamos en Bogotá. Puedes vernos en Google Maps desde el footer.');
        break;
      case 'promociones':
        this.addBotMessage('Hoy tenemos 2x1 en papas al comprar cualquier burger premium.');
        break;
      case 'carrito':
        this.openCart();
        break;
      case 'carrito_ver':
        this.showCartSummary();
        break;
      case 'carrito_vaciar':
        this.clearCart();
        break;
      case 'pedido_finalizar':
        this.finalizeOrderFromChat();
        break;
      case 'seguimiento':
        this.trackLatestOrder();
        break;
      case 'whatsapp':
        this.openWhatsApp();
        break;
    }
  }

  private respondTo(text: string): void {
    this.isSending = true;
    const lower = text.toLowerCase();

    // Reglas simples
    let responded = false;
    // Pequeña charla
    if (/(hola|buenas|hey|qué más|que mas|hello|hi)/.test(lower)) {
      this.addBotMessage('¡Hola! ¿En qué te ayudo hoy?');
      responded = true;
    } else if (/(gracias|thank you|ty|muchas gracias)/.test(lower)) {
      this.addBotMessage('¡Con gusto! 😊 ¿Algo más?');
      responded = true;
    } else if (/(quién eres|quien eres|qué eres|que eres)/.test(lower)) {
      this.addBotMessage('Soy tu asistente BurGur. Te ayudo con menú, carrito y pedidos.');
      responded = true;
    } else if (/(ayuda|help|qué puedes hacer|que puedes hacer)/.test(lower)) {
      this.showHelp();
      responded = true;
    }

    // Navegación y tienda
    if (/(menú|menu|carta)/.test(lower)) {
      this.handleIntent('menu');
      responded = true;
    } else if (/(hora|horario|abren|cierran)/.test(lower)) {
      this.handleIntent('horario');
      responded = true;
    } else if (/(dónde|ubicación|direccion|mapa)/.test(lower)) {
      this.handleIntent('ubicacion');
      responded = true;
    } else if (/(promo|promoción|descuento|oferta)/.test(lower)) {
      this.handleIntent('promociones');
      responded = true;
    } else if (/(carrito|ver carrito|abrir carrito)/.test(lower)) {
      this.handleIntent('carrito');
      responded = true;
    } else if (/(mostrar|ver|resumen).*(carrito)/.test(lower)) {
      this.handleIntent('carrito_ver');
      responded = true;
    } else if (/(vaciar|limpiar).*(carrito)/.test(lower)) {
      this.handleIntent('carrito_vaciar');
      responded = true;
    } else if (/(quitar|eliminar|remueve).*(del carrito|carrito)/.test(lower)) {
      this.removeProductFromCartByText(lower);
      responded = true;
    } else if (/(seguir|rastrear|track|seguimiento).*(pedido)/.test(lower) || /(pedido).*(seguir|rastrear|track)/.test(lower)) {
      this.handleIntent('seguimiento');
      responded = true;
    } else if (/(agrega|añade|quiero|pon|sumar|compra).*(burger|hamburguesa|hot dog|perro|combo|papas|bebida|postre)/.test(lower)) {
      this.tryAddProductFromText(lower);
      responded = true;
    } else if (/(finalizar|realizar|pagar|checkout|comprar).*(pedido|orden|carrito)/.test(lower)) {
      this.handleIntent('pedido_finalizar');
      responded = true;
    } else if (/(whatsapp|wasap|contacto|mensaje).*(pedido|hablar|chat)/.test(lower)) {
      this.handleIntent('whatsapp');
      responded = true;
    } else if (/\bprecio( de)?\s+(.+)/.test(lower)) {
      const m = lower.match(/\bprecio( de)?\s+(.+)/);
      const term = (m?.[2] || '').trim();
      if (term.length >= 2) this.searchProducts(term, true);
      else this.addBotMessage('Dime el nombre del producto para ver su precio.');
      responded = true;
    } else if (/\bbuscar\s+(.+)/.test(lower)) {
      const m = lower.match(/\bbuscar\s+(.+)/);
      const term = (m?.[1] || '').trim();
      if (term.length >= 2) this.searchProducts(term);
      else this.addBotMessage('Escribe algo como “buscar bbq” o “buscar papas”.');
      responded = true;
    } else if (/(categorías|categorias)/.test(lower)) {
      this.listCategories();
      responded = true;
    } else if (/(pago|método de pago|metodo de pago|tarjeta|efectivo|nequi|pagos)/.test(lower)) {
      this.paymentInfo();
      responded = true;
    } else if (/(tiempo|demora|entrega|preparación|preparacion)/.test(lower)) {
      this.estimateDelivery();
      responded = true;
    } else if (/(delivery|domicilio|cobertura|zona|barrios)/.test(lower)) {
      this.deliveryAreas();
      responded = true;
    }

    setTimeout(() => {
      if (!responded) {
        this.addBotMessage('Puedo ayudarte con menú, carrito, seguimiento, horarios y promociones.');
      }
      this.isSending = false;
    }, 600);
  }

  private openCart(): void {
    this.addBotMessage('Abriendo tu carrito…');
    document.dispatchEvent(new Event('openCartModal'));
  }

  private showCartSummary(): void {
    const carrito = this.pedidoService.getCarrito() || [];
    if (!carrito.length) {
      this.addBotMessage('Tu carrito está vacío. ¿Quieres ver el menú?');
      return;
    }
    const ensureProducts = (cb: () => void) => {
      if (this.productosCache && this.productosCache.length > 0) { cb(); }
      else { this.productoService.getProductos().subscribe(list => { this.productosCache = list || []; cb(); }); }
    };

    ensureProducts(() => {
      const nameOf = (id: number) => this.productosCache.find(p => p.id === id)?.nombre || `#${id}`;
      let total = 0;
      const lines = carrito.map(it => {
        const subtotal = (it.cantidad || 1) * (Number(it.precioUnitario) || 0);
        total += subtotal;
        return `• ${nameOf(it.productoId)} x${it.cantidad} — $${subtotal.toLocaleString('es-CO')}`;
      });
      const msg = [
        'Resumen de tu carrito:',
        ...lines,
        `Total: $${total.toLocaleString('es-CO')} (${carrito.reduce((t, i) => t + (i.cantidad || 0), 0)} ítems)`
      ].join('\n');
      this.addBotMessage(msg);
    });
  }

  private clearCart(): void {
    const carrito = this.pedidoService.getCarrito() || [];
    if (!carrito.length) {
      this.addBotMessage('Tu carrito ya está vacío.');
      return;
    }
    this.pedidoService.limpiarCarrito();
    this.toast.info('Carrito vacío', 2000);
    this.addBotMessage('He vaciado tu carrito.');
  }

  private tryAddProductFromText(lower: string): void {
    // Cargar productos si cache está vacía
    const ensureProducts = (cb: () => void) => {
      if (this.productosCache && this.productosCache.length > 0) {
        cb();
      } else {
        this.productoService.getProductos().subscribe(list => {
          this.productosCache = list || [];
          cb();
        });
      }
    };

    // Extraer cantidad (e.g., x2, 2, "dos" simple)
    const numberWords: Record<string, number> = { 'una':1, 'uno':1, 'dos':2, 'tres':3 };
    let qty = 1;
    const qtyMatch = lower.match(/\bx\s*(\d+)\b|\b(\d+)\b|\b(una|uno|dos|tres)\b/);
    if (qtyMatch) {
      qty = Number(qtyMatch[1] || qtyMatch[2]) || numberWords[qtyMatch[3]] || 1;
    }

    ensureProducts(() => {
      // Intento de coincidencia por nombre
      const pick = this.productosCache.find(p => {
        const name = String(p?.nombre || '').toLowerCase();
        return lower.includes(name) || name.includes(lower.replace(/(agrega|añade|quiero|pon|sumar|compra)/g,''));
      }) || this.fuzzyFind(lower);

      if (!pick) {
        this.addBotMessage('No pude identificar el producto. Prueba con el nombre exacto.');
        return;
      }

      const productoPedido: ProductoPedido = {
        productoId: pick.id,
        cantidad: Math.max(1, qty),
        precioUnitario: Number(pick.precio || 0),
        observaciones: ''
      };

      this.pedidoService.agregarAlCarrito(productoPedido);
      this.addBotMessage(`${pick.nombre} x${productoPedido.cantidad} agregado al carrito.`);
      this.toast.success(`${pick.nombre} agregado al carrito`, 2500);
      this.openCart();
    });
  }

  private fuzzyFind(lower: string): Producto | undefined {
    // Búsquedas por palabras clave comunes
    const keywords = [
      { key: 'clásica', alias: ['clasica','classic'] },
      { key: 'bbq', alias: ['barbecue'] },
      { key: 'hot dog', alias: ['perro','perro caliente'] },
      { key: 'combo', alias: [] },
      { key: 'papas', alias: ['fries'] },
      { key: 'bebida', alias: ['refresco'] },
      { key: 'postre', alias: ['dessert'] }
    ];
    const matchedKey = keywords.find(k => lower.includes(k.key) || k.alias.some(a => lower.includes(a)));
    if (!matchedKey) return undefined;
    return this.productosCache.find(p => String(p?.nombre || '').toLowerCase().includes(matchedKey.key));
  }

  private removeProductFromCartByText(lower: string): void {
    const carrito = this.pedidoService.getCarrito() || [];
    if (!carrito.length) {
      this.addBotMessage('Tu carrito está vacío, nada que quitar.');
      return;
    }
    const ensureProducts = (cb: () => void) => {
      if (this.productosCache && this.productosCache.length > 0) { cb(); }
      else { this.productoService.getProductos().subscribe(list => { this.productosCache = list || []; cb(); }); }
    };
    ensureProducts(() => {
      const matchItem = carrito.find(it => {
        const name = (this.productosCache.find(p => p.id === it.productoId)?.nombre || '').toLowerCase();
        return !!name && (lower.includes(name) || name.includes(lower.replace(/(quitar|eliminar|remueve|del carrito|carrito)/g,'')));
      });
      if (!matchItem) {
        this.addBotMessage('No identifiqué qué producto quitar. Intenta con el nombre exacto.');
        return;
      }
      const key = (matchItem as any).itemId || matchItem.productoId;
      this.pedidoService.eliminarDelCarritoPorItemId(key);
      const nombre = this.productosCache.find(p => p.id === matchItem.productoId)?.nombre || `#${matchItem.productoId}`;
      this.toast.warning(`${nombre} eliminado del carrito`, 2500);
      this.addBotMessage(`${nombre} eliminado del carrito.`);
      this.openCart();
    });
  }

  private trackLatestOrder(): void {
    const cliente = this.clienteService.getCurrentCliente();
    if (!cliente) {
      this.addBotMessage('Necesitas iniciar sesión para ver tus pedidos.');
      this.router.navigate(['/login']);
      return;
    }

    this.addBotMessage('Buscando tu pedido en progreso…');
    this.pedidoService.getPedidosCliente(cliente.id).subscribe(pedidos => {
      const activos = (pedidos || []).filter(p => ![EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO].includes(p.estado));
      const ultimo = activos.sort((a,b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())[0];
      if (!ultimo) {
        this.addBotMessage('No encontré pedidos activos. Puedes revisar tu historial.');
        this.router.navigate(['/orders']);
        return;
      }
      this.addBotMessage(`Abriendo seguimiento del pedido #${ultimo.id}…`);
      this.router.navigate([`/orders/${ultimo.id}/track`]);
    }, () => {
      this.addBotMessage('No pude obtener tus pedidos. Inténtalo más tarde.');
    });
  }

  private finalizeOrderFromChat(): void {
    const carrito = this.pedidoService.getCarrito() || [];
    if (!carrito.length) {
      this.addBotMessage('Tu carrito está vacío. Añade productos antes de finalizar.');
      return;
    }
    const cliente = this.clienteService.getCurrentCliente();
    if (!cliente) {
      this.addBotMessage('Necesitas iniciar sesión para finalizar tu pedido.');
      this.router.navigate(['/login']);
      return;
    }
    this.addBotMessage('Creando tu pedido…');
    this.pedidoService.crearPedido(cliente.id).subscribe({
      next: () => {
        this.pedidoService.limpiarCarrito();
        this.toast.success('Pedido creado. Revisando órdenes…', 2500);
        this.addBotMessage('¡Listo! Tu pedido fue creado. Te llevo a tus órdenes.');
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.addBotMessage('No pude crear el pedido. Inténtalo más tarde.');
      }
    });
  }

  private showHelp(): void {
    const help = [
      'Puedo ayudarte con:',
      '• “ver menú”, “promociones”, “horario”, “ubicación”',
      '• “mostrar carrito”, “vaciar carrito”, “finalizar pedido”',
      '• “agrega 2 bbq”, “quitar papas del carrito”',
      '• “buscar bbq”, “precio de clásica”',
      '• “categorías”, “método de pago”, “tiempo de entrega”, “cobertura”'
    ].join('\n');
    this.addBotMessage(help);
  }

  private searchProducts(term: string, onlyPrice: boolean = false): void {
    // Primero intenta búsqueda por API; si falla, usa cache local
    this.productoService.buscarProductos(term).subscribe(list => {
      const productos = list && list.length ? list : this.productosCache.filter(p => String(p.nombre || '').toLowerCase().includes(term.toLowerCase()));
      if (!productos.length) {
        this.addBotMessage(`No encontré productos para “${term}”. Prueba otra palabra.`);
        return;
      }
      if (onlyPrice) {
        const p = productos[0];
        this.addBotMessage(`${p.nombre}: $${Number(p.precio || 0).toLocaleString('es-CO')}`);
        return;
      }
      const top = productos.slice(0, 5);
      const msg = ['Resultados:', ...top.map(p => `• ${p.nombre} — $${Number(p.precio || 0).toLocaleString('es-CO')}`)].join('\n');
      this.addBotMessage(msg);
    }, () => {
      const productos = this.productosCache.filter(p => String(p.nombre || '').toLowerCase().includes(term.toLowerCase()));
      if (!productos.length) {
        this.addBotMessage(`No encontré productos para “${term}”.`);
        return;
      }
      const top = productos.slice(0, 5);
      const msg = ['Resultados:', ...top.map(p => `• ${p.nombre} — $${Number(p.precio || 0).toLocaleString('es-CO')}`)].join('\n');
      this.addBotMessage(msg);
    });
  }

  private listCategories(): void {
    const ensureProducts = (cb: () => void) => {
      if (this.productosCache && this.productosCache.length > 0) { cb(); }
      else { this.productoService.getProductos().subscribe(list => { this.productosCache = list || []; cb(); }); }
    };
    ensureProducts(() => {
      const cats = Array.from(new Set(this.productosCache.map(p => (p.categoria || '').trim()).filter(Boolean)));
      if (!cats.length) {
        this.addBotMessage('Aún no tengo categorías para mostrar.');
        return;
      }
      this.addBotMessage(['Categorías disponibles:', ...cats.map(c => `• ${c}`)].join('\n'));
    });
  }

  private paymentInfo(): void {
    this.addBotMessage('Método de pago: pago al recibir (efectivo). Pronto más opciones.');
  }

  private estimateDelivery(): void {
    this.addBotMessage('Tiempo estimado: 30–45 minutos según zona y demanda.');
  }

  private deliveryAreas(): void {
    this.addBotMessage('Entregamos en Bogotá, zonas cercanas a Chapinero. Consulta tu dirección al finalizar.');
  }

  private refreshQuickSuggestions(): void {
    const base = [
      { label: 'Ver menú', action: () => this.handleIntent('menu') },
      { label: 'Abrir carrito', action: () => this.handleIntent('carrito') },
      { label: 'Rastrear pedido', action: () => this.handleIntent('seguimiento') },
      { label: 'Promociones', action: () => this.handleIntent('promociones') }
    ];
    const extras = [] as { label: string; action: () => void }[];
    if (this.carritoCount > 0) {
      extras.push({ label: 'Mostrar carrito', action: () => this.handleIntent('carrito_ver') });
      extras.push({ label: 'Vaciar carrito', action: () => this.handleIntent('carrito_vaciar') });
      extras.push({ label: 'Finalizar pedido', action: () => this.handleIntent('pedido_finalizar') });
    }
    this.quickSuggestions = [...base, ...extras];
  }

  private openWhatsApp(): void {
    const phoneNumber = '571234567890';
    const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido en BurGur.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    this.addBotMessage('Abriendo WhatsApp…');
    this.toast.info('Abriendo WhatsApp', 2000);
  }
}