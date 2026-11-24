import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuickLinksService } from '../../core/quick-links-service';
import { Icon } from '../icon/icon';

/**
 * Top-bar Quick Links menu, as in the weld demo: the admin's links A to Z (each opens in a new tab),
 * then Change Log. Uses the CDK
 * overlay like the avatar menu, so both menus behave the same.
 */
@Component({
  selector: 'wt-quick-links-menu',
  imports: [RouterLink, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    <button
      type="button"
      class="btn btn-ghost btn-square text-primary-content hover:bg-primary-content/10"
      title="Quick Links"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      [attr.aria-expanded]="open()"
      aria-haspopup="true"
      aria-controls="quick-links-panel"
      (click)="toggle()"
    >
      <wt-icon name="external-link" />
      <span class="sr-only">Quick Links</span>
    </button>

    <!-- Angular CDK overlay: positions the panel; a click outside or Escape closes it. -->
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
        id="quick-links-panel"
        aria-label="Quick Links"
        class="mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow-lg"
      >
        <ul class="flex flex-col">
          <li>
            <a
              href="https://compass-rosy-mu.vercel.app/"
              class="flex items-center gap-2 rounded-field px-2 py-2 hover:bg-base-200 focus-visible:bg-base-200"
              (click)="close()"
            >
              <wt-icon name="external-link" />
              Back to Forge
            </a>
          </li>
          @for (link of links(); track link.id) {
            <li>
              <a
                [href]="link.url"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-2 rounded-field px-2 py-2 hover:bg-base-200 focus-visible:bg-base-200"
                data-testid="quick-link"
                (click)="close()"
              >
                <wt-icon name="external-link" />
                {{ link.label }}
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          }
          <li class="mt-1 border-t border-base-300 pt-1">
            <a
              routerLink="/changelog"
              class="flex items-center gap-2 rounded-field px-2 py-2 hover:bg-base-200 focus-visible:bg-base-200"
              data-testid="changelog-link"
              (click)="close()"
            >
              <wt-icon name="history" />
              Change Log
            </a>
          </li>
        </ul>
      </nav>
    </ng-template>
  `,
})
export class QuickLinksMenu {
  protected readonly links = inject(QuickLinksService).menuLinks;
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
