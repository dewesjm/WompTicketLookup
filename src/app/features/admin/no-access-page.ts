import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

/** Shown at an admin page's address to someone without that page's permission. */
@Component({
  selector: 'wt-no-access-page',
  imports: [RouterLink, Icon],
  template: `
    <h1 class="flex items-center gap-2 text-2xl font-semibold">
      <wt-icon name="lock" class="size-6" />
      No access
    </h1>
    <p class="mt-2">You don't have access to this page.</p>
    <a routerLink="/" class="link mt-2 inline-block">Back to Home</a>
  `,
})
export class NoAccessPage {}
