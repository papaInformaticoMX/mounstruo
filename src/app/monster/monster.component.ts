import { Component, input } from '@angular/core';

/**
 * El monstruo mascota del juego. Cuando el niño acierta se pone feliz:
 * salta, muestra los dientes y cambia su mensaje.
 */
@Component({
  selector: 'app-monster',
  template: `
    <div class="my-3 text-center" [class.animate-saltar]="estaFeliz()">
      <div
        class="relative mx-auto h-25 w-30 rounded-[50%_50%_40%_40%] bg-gradient-to-br from-fruta-verde to-emerald-500 shadow-lg shadow-emerald-500/40"
        aria-hidden="true"
      >
        <div class="flex justify-center gap-5 pt-5">
          <div class="flex size-6 items-center justify-center rounded-full bg-white">
            <div class="size-3 rounded-full bg-slate-700"></div>
          </div>
          <div class="flex size-6 items-center justify-center rounded-full bg-white">
            <div class="size-3 rounded-full bg-slate-700"></div>
          </div>
        </div>

        <div
          class="mx-auto mt-2.5 flex h-6 w-13 items-center justify-center overflow-hidden rounded-b-[50%] bg-[#c0392b]"
        >
          @if (estaFeliz()) {
            <div class="flex flex-col items-center leading-[0.8]">
              <span class="text-xs inline-block rotate-180">🦷</span>
              <div class="flex gap-1">
                <span class="text-xs inline-block">🦷</span>
                <span class="text-xs inline-block">🦷</span>
              </div>
            </div>
          }
        </div>
      </div>

      <p class="mt-3 text-lg text-slate-600 italic">
        @if (estaFeliz()) {
          ¡ÑAM ÑAM! ¡Qué rico! 😋
        } @else {
          ¡Tengo hambre de frutas! 🤤
        }
      </p>
    </div>
  `,
})
export class MonsterComponent {
  /** El monstruo celebra cuando el jugador acierta. */
  readonly estaFeliz = input(false);
}
