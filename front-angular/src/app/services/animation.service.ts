import { Injectable } from '@angular/core';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger,
  group,
  keyframes,
  state
} from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  // Fade animations
  static fadeIn = trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0 }))
    ])
  ]);

  static fadeInUp = trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

  static fadeInDown = trigger('fadeInDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

  static fadeInLeft = trigger('fadeInLeft', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]);

  static fadeInRight = trigger('fadeInRight', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]);

  // Scale animations
  static scaleIn = trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.9)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ]);

  
  static imageHover = trigger('imageHover', [
    state('normal', style({
      transform: 'rotate(10deg)'
    })),
    state('hovered', style({
      transform: 'rotate(0deg)'
    })),
    transition('normal => hovered', [
      animate('300ms ease-out')
    ]),
    transition('hovered => normal', [
      animate('300ms ease-in')
    ])
  ]);

  static scaleInUp = trigger('scaleInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
    ])
  ]);

  // Slide animations
  static slideInUp = trigger('slideInUp', [
    transition(':enter', [
      style({ transform: 'translateY(100%)' }),
      animate('400ms ease-out', style({ transform: 'translateY(0)' }))
    ])
  ]);

  static slideInDown = trigger('slideInDown', [
    transition(':enter', [
      style({ transform: 'translateY(-100%)' }),
      animate('400ms ease-out', style({ transform: 'translateY(0)' }))
    ])
  ]);

  static slideInLeft = trigger('slideInLeft', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('400ms ease-out', style({ transform: 'translateX(0)' }))
    ])
  ]);

  static slideInRight = trigger('slideInRight', [
    transition(':enter', [
      style({ transform: 'translateX(100%)' }),
      animate('400ms ease-out', style({ transform: 'translateX(0)' }))
    ])
  ]);

  // Stagger animations
  static staggerFadeIn = trigger('staggerFadeIn', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(100, [
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]);

  static staggerScaleIn = trigger('staggerScaleIn', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        stagger(100, [
          animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ], { optional: true })
    ])
  ]);

  // Card animations
  static cardHover = trigger('cardHover', [
    state('normal', style({
      transform: 'translateY(0)',
      boxShadow: 'var(--shadow)'
    })),
    state('hovered', style({
      transform: 'translateY(-4px)',
      boxShadow: 'var(--shadow-elevated)'
    })),
    transition('normal => hovered', [
      animate('200ms ease-out')
    ]),
    transition('hovered => normal', [
      animate('200ms ease-in')
    ])
  ]);

  // Button animations
  static buttonPress = trigger('buttonPress', [
    state('normal', style({
      transform: 'scale(1)'
    })),
    state('pressed', style({
      transform: 'scale(0.95)'
    })),
    transition('normal => pressed', [
      animate('100ms ease-out')
    ]),
    transition('pressed => normal', [
      animate('100ms ease-in')
    ])
  ]);

  // Loading spinner animation
  static spin = trigger('spin', [
    transition('* => *', [
      animate('1s linear', keyframes([
        style({ transform: 'rotate(0deg)' }),
        style({ transform: 'rotate(360deg)' })
      ]))
    ])
  ]);

  // Shimmer loading animation
  static shimmer = trigger('shimmer', [
    transition('* => *', [
      animate('1.5s ease-in-out', keyframes([
        style({ transform: 'translateX(-100%)' }),
        style({ transform: 'translateX(100%)' })
      ]))
    ])
  ]);

  // Page transitions
  static pageTransition = trigger('pageTransition', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
    ])
  ]);

  // Modal animations
  static modalEnter = trigger('modalEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }))
    ])
  ]);

  // Sidebar animations
  static sidebarSlide = trigger('sidebarSlide', [
    state('closed', style({
      transform: 'translateX(-100%)'
    })),
    state('open', style({
      transform: 'translateX(0)'
    })),
    transition('closed <=> open', [
      animate('300ms ease-in-out')
    ])
  ]);

  // List item animations
  static listItemEnter = trigger('listItemEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
    ])
  ]);

  // Notification animations
  static notificationSlide = trigger('notificationSlide', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ]),
    transition(':leave', [
      animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
    ])
  ]);

  // Progress bar animation
  static progressFill = trigger('progressFill', [
    transition('* => *', [
      animate('800ms ease-out')
    ])
  ]);

  // Pulse animation
  static pulse = trigger('pulse', [
    transition('* => *', [
      animate('2s ease-in-out', keyframes([
        style({ transform: 'scale(1)' }),
        style({ transform: 'scale(1.05)' }),
        style({ transform: 'scale(1)' })
      ]))
    ])
  ]);

  // Bounce animation
  static bounce = trigger('bounce', [
    transition('* => *', [
      animate('600ms ease-in-out', keyframes([
        style({ transform: 'translateY(0)' }),
        style({ transform: 'translateY(-10px)' }),
        style({ transform: 'translateY(0)' })
      ]))
    ])
  ]);

  // Get all animations for easy import
  static getAllAnimations() {
    return [
      this.fadeIn,
      this.fadeInUp,
      this.fadeInDown,
      this.fadeInLeft,
      this.fadeInRight,
      this.scaleIn,
      // this.scaleInConditional,
      this.scaleInUp,
      this.slideInUp,
      this.slideInDown,
      this.slideInLeft,
      this.slideInRight,
      this.staggerFadeIn,
      this.staggerScaleIn,
      this.cardHover,
      this.buttonPress,
      this.spin,
      this.shimmer,
      this.pageTransition,
      this.modalEnter,
      this.sidebarSlide,
      this.listItemEnter,
      this.notificationSlide,
      this.progressFill,
      this.pulse,
      this.bounce,
      // this.scaleState,
      this.imageHover
    ];
  }
} 