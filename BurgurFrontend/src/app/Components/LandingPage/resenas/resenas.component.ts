import { Component } from '@angular/core';

interface Resena {
  texto: string;
  autor: string;
}

@Component({
  selector: 'app-resenas',
  templateUrl: './resenas.component.html',
  styleUrls: []
})
export class ResenasComponent {
  resenas: Resena[] = [
    { texto: 'Excelente sabor y atención. Recomendado.', autor: 'Carlos M.' },
    { texto: 'Siempre entregan a tiempo y todo fresco.', autor: 'Laura P.' },
    { texto: 'Muy buena experiencia, volveré pronto.', autor: 'Andrés R.' },
    { texto: 'El hot dog supreme es mi favorito.', autor: 'María G.' },
    { texto: 'Ambiente agradable y atención excelente.', autor: 'Jorge S.' }
  ];

  currentIndex = 0;

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.resenas.length) % this.resenas.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.resenas.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }

  isActive(i: number): boolean {
    const visibleCount = 3;
    const end = (this.currentIndex + visibleCount - 1) % this.resenas.length;
    if (this.currentIndex + visibleCount <= this.resenas.length) {
      return i >= this.currentIndex && i < this.currentIndex + visibleCount;
    }
    return i >= this.currentIndex || i <= end;
  }
}