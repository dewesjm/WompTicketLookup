import { Injectable, signal } from '@angular/core';
import { seedQuickLinks } from '../../data';
import { menuOrder } from '../../domain';

/** The Quick Links menu's links, A to Z. A built-in copy for now (data/seed/quick-links.ts). */
@Injectable({ providedIn: 'root' })
export class QuickLinksService {
  readonly menuLinks = signal(menuOrder(seedQuickLinks())).asReadonly();
}
