import { NgTemplateOutlet } from '@angular/common';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, inject, signal } from '@angular/core';
import { PersonasService } from '../../core/personas-service';
import { ThemeService } from '../../core/theme-service';
import { ViewerService } from '../../core/viewer-service';
import { Icon } from '../icon/icon';
import { BRAND_THEMES, BUILT_IN_THEMES } from '../themes';

/**
 * Top-right button with the viewer's initials; opens a menu with who you are, Preferences (View
 * as (demo)) and the theme list. Copied from Ready to Work. No Reset demo data: this app saves no
 * data of its own, only the viewer's preferences.
 */
@Component({
  selector: 'wt-avatar-menu',
  imports: [NgTemplateOutlet, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  templateUrl: './avatar-menu.html',
})
export class AvatarMenu {
  protected readonly themes = inject(ThemeService);
  protected readonly viewer = inject(ViewerService);
  protected readonly personas = inject(PersonasService);
  protected readonly brandThemes = BRAND_THEMES;
  protected readonly builtInThemes = BUILT_IN_THEMES;
  protected readonly open = signal(false);
  /** Below the button, right edges lined up. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  ];

  toggle(): void {
    this.open.update((o) => !o);
  }

  close(): void {
    this.open.set(false);
  }

  pick(id: string): void {
    this.themes.set(id);
  }

  setPersona(id: string): void {
    this.viewer.setPersona(id);
  }

}
