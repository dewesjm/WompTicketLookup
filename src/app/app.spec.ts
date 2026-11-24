import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { DemoDataService } from './core/demo-data-service';

describe('App', () => {
  it('shows the top bar: Womp Ticket Lookup, Quick Links and the avatar button', async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(DemoDataService).load();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('header')!;

    expect(header.querySelector('a[href="/"]')?.textContent).toContain('Womp Ticket Lookup');
    expect(header.textContent).toContain('Quick Links');
    expect(header.querySelector('wt-avatar-menu button')?.textContent?.trim()).toBe('RH');
  });
});
