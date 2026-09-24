import { Component, signal } from '@angular/core';
import { GameComponent } from './game/game.component';

@Component({
  imports: [ GameComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mounstruo');
}
