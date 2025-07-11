import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('dark');
  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  constructor() {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark');
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme to document body
    document.body.setAttribute('data-theme', theme);
    
    // Update Material theme class
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  isLightMode(): boolean {
    return this.getCurrentTheme() === 'light';
  }
} 