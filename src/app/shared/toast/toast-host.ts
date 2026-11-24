import { Component, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { ToastService, ToastSeverity } from './toast-service';

const ALERT_CLASS: Record<ToastSeverity, string> = {
  success: 'alert-success',
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
};

/**
 * Shows the toasts at the bottom of the window (daisyUI toast and alert), copied from the weld
 * demo. Mounted once in the app shell. A polite live region, so screen readers hear them too.
 */
@Component({
  selector: 'wt-toast-host',
  imports: [Icon],
  template: `
    <div class="toast toast-center toast-bottom z-50" role="status" aria-live="polite">
      @for (m of toasts.messages(); track m.id) {
        <div class="alert" [class]="alertClass[m.severity]">
          <div class="grow">
            <span class="font-semibold">{{ m.summary }}</span>
            @if (m.detail) {
              <div>{{ m.detail }}</div>
            }
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-square"
            aria-label="Dismiss"
            (click)="toasts.dismiss(m.id)"
          >
            <wt-icon name="x" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
  protected readonly alertClass = ALERT_CLASS;
}
