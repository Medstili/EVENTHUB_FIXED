import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  
  private breakpoints = {
    handset: [Breakpoints.Handset],
  };

  constructor(private breakpointObserver: BreakpointObserver) {}

  // Individual breakpoint observables
  get isHandset$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.handset)
      .pipe(map(result => result.matches));
  }

   // Responsive card layout helpers
   getCardLayout(): Observable<'compact' | 'comfortable'> {
    return this.isHandset$.pipe(
      map(isHandset => isHandset ? 'compact' : 'comfortable')
    );
  }
  
} 