import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

export interface ResponsiveBreakpoints {
  isHandset: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  
  private breakpoints = {
    handset: [Breakpoints.Handset],
    tablet: [Breakpoints.Tablet],
    desktop: [Breakpoints.Web],
    largeDesktop: ['(min-width: 1200px)'],
    mobile: ['(max-width: 768px)'],
    portrait: [Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait],
    landscape: [Breakpoints.HandsetLandscape, Breakpoints.TabletLandscape]
  };

  constructor(private breakpointObserver: BreakpointObserver) {}

  // Individual breakpoint observables
  get isHandset$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.handset)
      .pipe(map(result => result.matches));
  }

  get isTablet$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.tablet)
      .pipe(map(result => result.matches));
  }

  get isDesktop$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.desktop)
      .pipe(map(result => result.matches));
  }

  get isLargeDesktop$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.largeDesktop)
      .pipe(map(result => result.matches));
  }

  get isMobile$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.mobile)
      .pipe(map(result => result.matches));
  }

  get isPortrait$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.portrait)
      .pipe(map(result => result.matches));
  }

  get isLandscape$(): Observable<boolean> {
    return this.breakpointObserver.observe(this.breakpoints.landscape)
      .pipe(map(result => result.matches));
  }

  // Combined responsive state
  get responsiveState$(): Observable<ResponsiveBreakpoints> {
    return this.breakpointObserver.observe([
      ...this.breakpoints.handset,
      ...this.breakpoints.tablet,
      ...this.breakpoints.desktop,
      ...this.breakpoints.largeDesktop,
      ...this.breakpoints.mobile,
      ...this.breakpoints.portrait,
      ...this.breakpoints.landscape
    ]).pipe(
      map(() => ({
        isHandset: this.breakpointObserver.isMatched(this.breakpoints.handset),
        isTablet: this.breakpointObserver.isMatched(this.breakpoints.tablet),
        isDesktop: this.breakpointObserver.isMatched(this.breakpoints.desktop),
        isLargeDesktop: this.breakpointObserver.isMatched(this.breakpoints.largeDesktop),
        isMobile: this.breakpointObserver.isMatched(this.breakpoints.mobile),
        isPortrait: this.breakpointObserver.isMatched(this.breakpoints.portrait),
        isLandscape: this.breakpointObserver.isMatched(this.breakpoints.landscape)
      }))
    );
  }

  // Utility methods for common responsive patterns
  get isSmallScreen$(): Observable<boolean> {
    return this.breakpointObserver.observe(['(max-width: 480px)'])
      .pipe(map(result => result.matches));
  }

  get isMediumScreen$(): Observable<boolean> {
    return this.breakpointObserver.observe(['(min-width: 481px) and (max-width: 768px)'])
      .pipe(map(result => result.matches));
  }

  get isLargeScreen$(): Observable<boolean> {
    return this.breakpointObserver.observe(['(min-width: 769px) and (max-width: 1024px)'])
      .pipe(map(result => result.matches));
  }

  get isExtraLargeScreen$(): Observable<boolean> {
    return this.breakpointObserver.observe(['(min-width: 1025px)'])
      .pipe(map(result => result.matches));
  }

  // Grid column helpers
  getGridColumns(breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): Observable<number> {
    const breakpointMap = {
      xs: ['(max-width: 480px)'],
      sm: ['(min-width: 481px) and (max-width: 768px)'],
      md: ['(min-width: 769px) and (max-width: 1024px)'],
      lg: ['(min-width: 1025px) and (max-width: 1200px)'],
      xl: ['(min-width: 1201px)']
    };

    return this.breakpointObserver.observe(breakpointMap[breakpoint])
      .pipe(map(result => result.matches ? this.getColumnCount(breakpoint) : 1));
  }

  private getColumnCount(breakpoint: string): number {
    const columnMap = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    };
    return columnMap[breakpoint as keyof typeof columnMap] || 1;
  }

  // Responsive spacing helpers
  getResponsiveSpacing(): Observable<string> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'var(--space-3)' : 'var(--space-6)')
    );
  }

  getResponsivePadding(): Observable<string> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'var(--space-4)' : 'var(--space-8)')
    );
  }

  getResponsiveFontSize(): Observable<string> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'var(--text-base)' : 'var(--text-lg)')
    );
  }

  // Responsive layout helpers
  getResponsiveLayout(): Observable<'stack' | 'grid' | 'flex'> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'stack';
        if (state.isTablet) return 'grid';
        return 'flex';
      })
    );
  }

  // Responsive navigation helpers
  getNavigationType(): Observable<'mobile' | 'desktop'> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'mobile' : 'desktop')
    );
  }

  // Responsive card layout helpers
  getCardLayout(): Observable<'compact' | 'comfortable'> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'compact' : 'comfortable')
    );
  }

  // Responsive form layout helpers
  getFormLayout(): Observable<'single' | 'multi'> {
    return this.isLargeDesktop$.pipe(
      map(isLarge => isLarge ? 'multi' : 'single')
    );
  }

  // Responsive chart helpers
  getChartDimensions(): Observable<{ width: string; height: string }> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) {
          return { width: '100%', height: '200px' };
        } else if (state.isTablet) {
          return { width: '100%', height: '300px' };
        } else {
          return { width: '100%', height: '400px' };
        }
      })
    );
  }

  // Responsive image helpers
  getImageSize(): Observable<'small' | 'medium' | 'large'> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'small';
        if (state.isTablet) return 'medium';
        return 'large';
      })
    );
  }

  // Responsive button helpers
  getButtonSize(): Observable<'small' | 'medium' | 'large'> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'small';
        if (state.isTablet) return 'medium';
        return 'large';
      })
    );
  }

  // Responsive text helpers
  getTextSize(): Observable<'small' | 'medium' | 'large'> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'small';
        if (state.isTablet) return 'medium';
        return 'large';
      })
    );
  }

  // Responsive margin helpers
  getResponsiveMargin(): Observable<string> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'var(--space-2)';
        if (state.isTablet) return 'var(--space-4)';
        return 'var(--space-6)';
      })
    );
  }

  // Responsive grid helpers for filters
  getFilterGridColumns(): Observable<string> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return '1fr';
        if (state.isTablet) return '1fr 1fr';
        return '2fr 1fr 1fr 1fr';
      })
    );
  }

  // Responsive container padding
  getContainerPadding(): Observable<string> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return 'var(--space-4)';
        return 'var(--space-6)';
      })
    );
  }

  // Responsive table min-width
  getTableMinWidth(): Observable<string> {
    return this.responsiveState$.pipe(
      map(state => {
        if (state.isHandset) return '800px';
        return '1000px';
      })
    );
  }

  // Responsive header layout
  getHeaderLayout(): Observable<'row' | 'column'> {
    return this.isMobile$.pipe(
      map(isMobile => isMobile ? 'column' : 'row')
    );
  }

  // Responsive filter actions visibility
  getFilterActionsVisible(): Observable<boolean> {
    return this.isMobile$.pipe(
      map(isMobile => !isMobile)
    );
  }
} 