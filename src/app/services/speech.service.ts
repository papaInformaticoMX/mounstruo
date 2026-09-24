import { Service, signal } from '@angular/core';

/**
 * Lee textos en voz alta con la Web Speech API del navegador
 * (window.speechSynthesis), para que el niño escuche la pregunta y los
 * mensajes del juego aunque todavía no sepa leer.
 */
@Service()
export class SpeechService {
  /** Indica si la voz está activada; se puede silenciar desde el juego. */
  readonly vozActiva = signal(true);

  /** Enciende o apaga la voz. Al apagarla, detiene la lectura en curso. */
  alternarVoz(): void {
    this.vozActiva.update(activa => !activa);

    if (!this.vozActiva()) {
      this.detener();
    }
  }

  /**
   * Lee un texto en español. Cancela la lectura anterior para que
   * los mensajes no se encimen unos con otros.
   */
  hablar(texto: string): void {
    if (!this.vozActiva() || !this.hayVozDisponible()) {
      return;
    }

    const lectura = new SpeechSynthesisUtterance(this.sinEmojis(texto));
    lectura.lang = 'es-ES';
    lectura.rate = 0.95; // un poco más despacio, pensado para niños
    lectura.pitch = 1.2; // tono agudo y amigable

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(lectura);
  }

  /** Detiene la lectura en curso. */
  detener(): void {
    if (this.hayVozDisponible()) {
      window.speechSynthesis.cancel();
    }
  }

  /** speechSynthesis solo existe en el navegador, no durante el SSR. */
  private hayVozDisponible(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Deja solo letras, números y signos básicos, para que el sintetizador
   * no se atragante leyendo emojis como "cara sonriente con...".
   */
  private sinEmojis(texto: string): string {
    return texto.replace(/[^\p{L}\p{N}\s¡!¿?.,'’-]/gu, '').trim();
  }
}
