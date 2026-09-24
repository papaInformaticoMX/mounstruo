import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monster" [class.happy]="estaFeliz()">
      <div class="monster-body">
        <div class="monster-eyes">
          <div class="eye left">
            <div class="pupil"></div>
          </div>
          <div class="eye right">
            <div class="pupil"></div>
          </div>
        </div>

        <div class="monster-mouth">
          @if (estaFeliz()) {
            <span class="teeth">🦷 🦷 🦷</span>
          }
        </div>
      </div>

      <div class="monster-speech">
        @if (estaFeliz()) {
          <p>¡ÑAM ÑAM! ¡Qué rico! 😋</p>
        } @else {
          <p>¡Tengo hambre de frutas! 🤤</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .monster {
      margin: 10px auto;
      text-align: center;
      transition: transform 0.3s;
    }

    .monster.happy {
      animation: monsterJump 0.6s ease;
    }

    .monster-body {
      width: 120px;
      height: 100px;
      background: linear-gradient(135deg, #6bcf7f, #2ecc71);
      border-radius: 50% 50% 40% 40%;
      margin: 0 auto;
      position: relative;
      box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
    }

    .monster-eyes {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding-top: 20px;
    }

    .eye {
      width: 25px;
      height: 25px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pupil {
      width: 12px;
      height: 12px;
      background: #333;
      border-radius: 50%;
    }

    .monster-mouth {
      width: 50px;
      height: 25px;
      background: #c0392b;
      border-radius: 0 0 50% 50%;
      margin: 10px auto 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .teeth {
      font-size: 0.7rem;
    }

    .monster-speech {
      margin-top: 10px;
      font-size: 1.1rem;
      color: #555;
      font-style: italic;
    }

    @keyframes monsterJump {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px) scale(1.1); }
    }
  `]
})
export class MonsterComponent {
  estaFeliz = input<boolean>(false);
}
