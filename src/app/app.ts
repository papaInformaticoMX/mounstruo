import { Component } from '@angular/core';
import { GameComponent } from './game/game.component';

@Component({
  imports: [ GameComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
}
