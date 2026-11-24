import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminMenu } from '../admin-menu/admin-menu';
import { AvatarMenu } from '../avatar-menu/avatar-menu';
import { Icon } from '../icon/icon';
import { QuickLinksMenu } from '../quick-links-menu/quick-links-menu';
import { ToastHost } from '../toast/toast-host';

/**
 * Top bar (logo and name, Quick Links, Admin menu, avatar menu) around the routed page. Copied
 * from Ready to Work.
 */
@Component({
  selector: 'wt-app-shell',
  imports: [RouterLink, RouterOutlet, Icon, QuickLinksMenu, AdminMenu, AvatarMenu, ToastHost],
  template: `
    <header class="navbar gap-2 bg-primary px-4 text-primary-content shadow-sm">
      <a
        routerLink="/"
        class="flex items-center gap-2 text-lg font-semibold max-sm:min-h-11 max-sm:min-w-11 max-sm:justify-center"
      >
        <wt-icon name="ticket" class="size-6 text-accent" />
        <span class="max-sm:sr-only">Womp Ticket Lookup</span>
      </a>
      <div class="grow"></div>
      <wt-quick-links-menu />
      <wt-admin-menu />
      <wt-avatar-menu />
    </header>

    <main class="w-full grow p-4 sm:p-6">
      <router-outlet />
    </main>
    <wt-toast-host />
  `,
  host: { class: 'flex min-h-dvh flex-col bg-base-200 text-base-content' },
})
export class AppShell {}
