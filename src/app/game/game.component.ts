import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MonsterComponent } from '../monster/monster.component';
import { SpeechService } from '../services/speech.service';

/** Una pieza de confeti que cae por la pantalla durante la celebración. */
interface PiezaConfeti {
  readonly id: number;
  /** Posición horizontal, en % del ancho de la pantalla. */
  readonly izquierda: number;
  readonly color: string;
  /** Segundos de espera antes de empezar a caer. */
  readonly retardo: number;
  /** true = círculo, false = cuadrado. */
  readonly esRedonda: boolean;
}

/** Qué le está mostrando el juego al niño en este momento. */
type EstadoJuego = 'pregunta' | 'acierto' | 'error';

/** Cuántas piezas de confeti caen en cada celebración. */
const PIEZAS_DE_CONFETI = 30;

/** Cuánto dura la celebración antes de pasar a la siguiente pregunta. */
const DURACION_CELEBRACION_MS = 3500;

@Component({
  selector: 'app-game',
  imports: [MonsterComponent],
  templateUrl: './game.component.html',
})
export class GameComponent {
  private readonly voz = inject(SpeechService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly frutasDisponibles = [
    '🍎', // 1  - Manzana roja
    '🍊', // 2  - Mandarina/Naranja
    '🍋', // 3  - Limón
    '🍇', // 4  - Uvas
    '🍓', // 5  - Fresa
    '🍉', // 6  - Sandía
    '🍌', // 7  - Plátano
    '🍒', // 8  - Cerezas
    '🍑', // 9  - Durazno
    '🍍', // 10 - Piña
  ];

  private readonly coloresConfeti = [
    '#FF6B6B', // 1  - Rojo coral
    '#FF9F43', // 2  - Naranja durazno
    '#FFD93D', // 3  - Amarillo dorado
    '#A8E063', // 4  - Verde lima suave
    '#6BCF7F', // 5  - Verde menta
    '#4ECDC4', // 6  - Turquesa
    '#4DACFF', // 7  - Azul cielo
    '#5B8DEF', // 8  - Azul índigo
    '#A29BFE', // 9  - Lavanda
    '#FF6FB5', // 10 - Rosa chicle
  ];

  /** Números que el niño puede elegir como respuesta. */
  protected readonly numerosDisponibles = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  /** Color de cada botón numérico, para reconocerlo de lejos. */
  protected readonly colorDelNumero: Record<number, string> = {
    1: 'bg-[#FF6B6B] text-white',
    2: 'bg-[#FF9F43] text-white',
    3: 'bg-[#FFD93D] text-amber-900',
    4: 'bg-[#A8E063] text-white',
    5: 'bg-[#6BCF7F] text-white',
    6: 'bg-[#4ECDC4] text-white',
    7: 'bg-[#4DACFF] text-white',
    8: 'bg-[#5B8DEF] text-white',
    9: 'bg-[#A29BFE] text-white',
    10: 'bg-[#FF6FB5] text-white',
  };

  protected readonly cantidadFrutas = signal(this.generarCantidadAleatoria());
  protected readonly frutaActual = signal(this.elegirFrutaAleatoria());
  protected readonly puntuacion = signal(0);
  protected readonly estado = signal<EstadoJuego>('pregunta');
  protected readonly confeti = signal<PiezaConfeti[]>([]);

  /**
   * Número de la ronda actual. Cambia con cada pregunta nueva y sirve
   * para que las frutas se vuelvan a dibujar (y reboten) desde cero.
   */
  protected readonly ronda = signal(0);

  /** Frutas que se muestran: una por cada unidad que hay que contar. */
  protected readonly listaFrutas = computed(() => {
    const cantidad = this.cantidadFrutas();
    const fruta = this.frutaActual();
    return Array.from({ length: cantidad }, () => fruta);
  });

  /** Texto que se muestra (y se lee en voz alta) según el estado. */
  protected readonly mensajeFeedback = computed(() => {
    switch (this.estado()) {
      case 'acierto':
        return '🎉 ¡MUY BIEN! 🎉';
      case 'error':
        return '💪 ¡Casi! Inténtalo de nuevo';
      default:
        return '🤔 ¿Cuántas frutas ves?';
    }
  });

  /** Color del mensaje de feedback según el estado. */
  protected readonly clasesMensaje = computed(() => {
    switch (this.estado()) {
      case 'acierto':
        return 'bg-green-100 text-green-800 animate-celebrar';
      case 'error':
        return 'bg-amber-100 text-amber-800 animate-sacudir';
      default:
        return 'text-slate-600';
    }
  });

  protected readonly celebrando = computed(() => this.estado() === 'acierto');
  protected readonly vozActiva = this.voz.vozActiva;

  private temporizadorCelebracion?: ReturnType<typeof setTimeout>;
  private idConfeti = 0;

  constructor() {
    this.voz.hablar(this.mensajeFeedback()); // lee la primera pregunta

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.temporizadorCelebracion);
      this.voz.detener();
    });
  }

  /** El niño toca uno de los botones numéricos. */
  protected seleccionarNumero(numero: number): void {
    if (this.celebrando()) {
      return; // durante la celebración se ignoran nuevos intentos
    }

    if (numero === this.cantidadFrutas()) {
      this.registrarAcierto();
    } else {
      this.estado.set('error');
      this.voz.hablar(this.mensajeFeedback());
    }
  }

  /** Genera una nueva pregunta: fruta y cantidad al azar. */
  protected siguienteRonda(): void {
    clearTimeout(this.temporizadorCelebracion);

    this.cantidadFrutas.set(this.generarCantidadAleatoria());
    this.frutaActual.set(this.elegirFrutaAleatoria());
    this.estado.set('pregunta');
    this.ronda.update(numero => numero + 1);
    this.confeti.set([]);
    this.voz.hablar(this.mensajeFeedback()); // lee la nueva pregunta
  }

  /** Enciende o apaga la voz del juego. */
  protected alternarVoz(): void {
    this.voz.alternarVoz();
  }

  private registrarAcierto(): void {
    this.estado.set('acierto');
    this.puntuacion.update(puntos => puntos + 1);
    this.voz.hablar(this.mensajeFeedback());
    this.lanzarConfeti();
    this.programarSiguienteRonda();
  }

  /**
   * Espera a que termine la celebración y arranca la siguiente ronda
   * automáticamente, para que el niño no dependa de leer ningún botón.
   */
  private programarSiguienteRonda(): void {
    this.temporizadorCelebracion = setTimeout(
      () => this.siguienteRonda(),
      DURACION_CELEBRACION_MS,
    );
  }

  private lanzarConfeti(): void {
    const piezas: PiezaConfeti[] = Array.from({ length: PIEZAS_DE_CONFETI }, () => ({
      id: this.idConfeti++,
      izquierda: Math.random() * 100,
      color: this.coloresConfeti[Math.floor(Math.random() * this.coloresConfeti.length)],
      retardo: Math.random(), // hasta 1 segundo de espera
      esRedonda: Math.random() > 0.5,
    }));

    this.confeti.set(piezas);
  }

  private generarCantidadAleatoria(): number {
    return Math.floor(Math.random() * 8) + 1;
  }

  private elegirFrutaAleatoria(): string {
    const indice = Math.floor(Math.random() * this.frutasDisponibles.length);
    return this.frutasDisponibles[indice];
  }
}
