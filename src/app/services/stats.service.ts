import { Injectable, effect, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface NumberStats {
  numero: number;
  aciertos: number;
  fallas: number;
  dominado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly STORAGE_KEY = 'mounstruo_stats';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  
  public readonly stats = signal<Record<number, NumberStats>>(this.loadStats());

  constructor() {
    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats()));
      }
    });
  }

  private loadStats(): Record<number, NumberStats> {
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing stats from localStorage', e);
        }
      }
    }
    
    const defaultStats: Record<number, NumberStats> = {};
    for (let i = 1; i <= 9; i++) {
      defaultStats[i] = { numero: i, aciertos: 0, fallas: 0, dominado: false };
    }
    return defaultStats;
  }

  registrarAcierto(numero: number): boolean {
    this.stats.update(current => {
      const numStats = { ...(current[numero] || { numero, aciertos: 0, fallas: 0, dominado: false }) };
      numStats.aciertos++;
      
      if (!numStats.dominado) {
        if (numStats.fallas === 0 && numStats.aciertos >= 2) {
          numStats.dominado = true;
        } else if (numStats.fallas > 0 && numStats.aciertos >= 4) {
          numStats.dominado = true;
        }
      }
      return { ...current, [numero]: numStats };
    });
    
    return this.todosDominados();
  }

  todosDominados(): boolean {
    const s = this.stats();
    for (let i = 1; i <= 9; i++) {
      if (!s[i] || !s[i].dominado) {
        return false;
      }
    }
    return true;
  }

  reiniciarJuego(): void {
    const defaultStats: Record<number, NumberStats> = {};
    for (let i = 1; i <= 9; i++) {
      defaultStats[i] = { numero: i, aciertos: 0, fallas: 0, dominado: false };
    }
    this.stats.set(defaultStats);
  }

  registrarFalla(numero: number) {
    this.stats.update(current => {
      const numStats = { ...(current[numero] || { numero, aciertos: 0, fallas: 0, dominado: false }) };
      numStats.fallas++;
      
      // Si falla, pierde el estado de dominado
      numStats.dominado = false;
      return { ...current, [numero]: numStats };
    });
  }

  siguienteNumeroPonderado(disponibles: number[]): number {
    const currentStats = this.stats();
    
    const weights = disponibles.map(num => {
      const s = currentStats[num] || { aciertos: 0, fallas: 0, dominado: false };
      
      if (s.dominado) {
        // Probabilidad muy baja si ya está dominado
        return { num, weight: 1 };
      }
      
      let weight = 10;
      if (s.aciertos === 0 && s.fallas === 0) {
        weight = 20; // Nunca mostrado o sin intentos
      } else if (s.fallas > 0) {
        weight = 15 + (s.fallas * 5); // Si falla, aumenta su probabilidad
      } else if (s.aciertos > 0) {
        // Disminuye su aparición después de cada acierto
        weight = Math.max(2, 10 - (s.aciertos * 4));
      }
      
      return { num, weight };
    });

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weights) {
      random -= w.weight;
      if (random <= 0) {
        return w.num;
      }
    }
    
    return disponibles[Math.floor(Math.random() * disponibles.length)];
  }

  esDominado(numero: number): boolean {
    return this.stats()[numero]?.dominado || false;
  }
}
