import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  quickSuggestions = [
    { label: 'Ver menú', action: () => this.handleIntent('menu') },
    { label: 'Horario', action: () => this.handleIntent('horario') },
    { label: 'Ubicación', action: () => this.handleIntent('ubicacion') },
    { label: 'Promociones', action: () => this.handleIntent('promociones') }
  ];

  constructor(private router: Router) {
    this.bootstrap();
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

  private handleIntent(intent: 'menu' | 'horario' | 'ubicacion' | 'promociones'): void {
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
    }
  }

  private respondTo(text: string): void {
    this.isSending = true;
    const lower = text.toLowerCase();

    // Reglas simples
    let responded = false;
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
    }

    setTimeout(() => {
      if (!responded) {
        this.addBotMessage('Puedo ayudarte con menú, horarios, ubicación y promociones.');
      }
      this.isSending = false;
    }, 600);
  }
}