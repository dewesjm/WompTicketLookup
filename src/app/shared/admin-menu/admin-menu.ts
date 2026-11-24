import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { adminPagesFor } from '../../core/admin-pages';
import { ViewerService } from '../../core/viewer-service';
import { Icon } from '../icon/icon';

/**
 * Top-bar Admin menu: the admin pages the viewer may use. Hidden for someone with no admin
 * permission. Built like the Quick Links menu (CDK overlay), so the menus behave the same.
 */
@Component({
  selector: 'wt-admin-menu',
  imports: [RouterLink, RouterLinkActive, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    @if (pages().length > 0) {
      <button
        type="button"
        class="btn btn-ghost gap-1 px-2 font-medium text-primary-content hover:bg-primary-content/10"
        cdkOverlayOrigin
        #trigger="cdkOverlayOrigin"
        [attr.aria-expanded]="open()"
        aria-haspopup="true"
        aria-controls="admin-menu-panel"
        (click)="toggle()"
      >
        <wt-icon name="settings" />
        <span class="max-sm:sr-only">Admin</span>
        <wt-icon name="chevron-down" class="max-sm:hidden" />
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="open()"
        [cdkConnectedOverlayPositions]="positions"
        cdkConnectedOverlayHasBackdrop
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="close()"
        (detach)="close()"
      >
        <nav
          id="admin-menu-panel"
          aria-label="Admin"
          class="mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow-lg"
        >
          <ul class="flex flex-col">
            @for (page of pages(); track page.path) {
              <li>
                <a
                  [routerLink]="['/admin', page.path]"
                  routerLinkActive="font-semibold"
                  ariaCurrentWhenActive="page"
                  class="flex items-center gap-2 rounded-field px-2 py-2 hover:bg-base-200 focus-visible:bg-base-200"
                  (click)="close()"
                >
                  <wt-icon [name]="page.icon" />
                  {{ page.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </ng-template>
    }
  `,
})
export class AdminMenu {
  private readonly viewer = inject(ViewerService);
  protected readonly pages = computed(() => adminPagesFor(this.viewer.permissions()));
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
}
