import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonsterComponent } from '../monster/monster.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MonsterComponent],
  templateUrl: './game.component.html',
})
export class GameComponent {
  cantidadFrutas = signal<number>(this.generarCantidadAleatoria());
  numeroSeleccionado = signal<number | null>(null);
  estadoFeedback = signal<'ninguno' | 'acierto' | 'error'>('ninguno');
  puntuacion = signal<number>(0);
  readonly numerosDisponibles = [1, 2, 3, 4, 5];
  private readonly frutas = ['🍎', '🍊', '🍋', '🍇', '🍓'];
  frutaActual = signal<string>(this.seleccionarFrutaAleatoria());

  esAcierto = computed(() =>
    this.numeroSeleccionado() === this.cantidadFrutas()
  );

  listaFrutas = computed(() => {
    const cantidad = this.cantidadFrutas();
    const fruta = this.frutaActual();
    return Array.from({ length: cantidad }, () => fruta);
  });

  mensajeFeedback = computed(() => {
    switch (this.estadoFeedback()) {
      case 'acierto':
        return '🎉 ¡MUY BIEN! ¡El monstruo está feliz! 🎉';
      case 'error':
        return '💪 ¡Casi! Cuenta de nuevo e inténtalo';
      default:
        return '🤔 ¿Cuántas frutas ves? ¡Cuéntalas y elige el número!';
    }
  });

  claseFeedback = computed(() => {
    switch (this.estadoFeedback()) {
      case 'acierto': return 'success';
      case 'error': return 'try-again';
      default: return '';
    }
  });

  seleccionarNumero(numero: number): void {
    this.numeroSeleccionado.set(numero);

    if (numero === this.cantidadFrutas()) {
      this.estadoFeedback.set('acierto');
      this.puntuacion.update(p => p + 1);
      this.lanzarConfeti();
    } else {
      this.estadoFeedback.set('error');
    }
  }

  siguienteRonda(): void {
    this.cantidadFrutas.set(this.generarCantidadAleatoria());
    this.frutaActual.set(this.seleccionarFrutaAleatoria());
    this.numeroSeleccionado.set(null);
    this.estadoFeedback.set('ninguno');
  }

  private generarCantidadAleatoria(): number {
    return Math.floor(Math.random() * 5) + 1;
  }

  private seleccionarFrutaAleatoria(): string {
    const indice = Math.floor(Math.random() * this.frutas.length);
    return this.frutas[indice];
  }

  private lanzarConfeti(): void {
    const colores = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a29bfe'];

    for (let i = 0; i < 30; i++) {
      const confeti = document.createElement('div');
      confeti.className = 'confetti';
      confeti.style.left = Math.random() * 100 + 'vw';
      confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
      confeti.style.animationDelay = Math.random() * 2 + 's';
      confeti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      document.body.appendChild(confeti);

      setTimeout(() => confeti.remove(), 3000);
    }
  }
}
