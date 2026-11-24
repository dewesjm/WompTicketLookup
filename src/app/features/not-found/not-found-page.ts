import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'wt-not-found-page',
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl font-semibold">Page not found</h1>
    <a routerLink="/" class="link mt-2 inline-block">Back to Womp Ticket Lookup</a>
  `,
})
export class NotFoundPage {}
