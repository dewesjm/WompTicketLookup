import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DemoDataService } from '../../core/demo-data-service';
import { ViewerService } from '../../core/viewer-service';
import { AdminMenu } from './admin-menu';

describe('AdminMenu', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(DemoDataService).load();
  });

  async function open(personaId: string) {
    TestBed.inject(ViewerService).setPersona(personaId);
    const fixture = TestBed.createComponent(AdminMenu);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector('button');
    toggle?.click();
    await fixture.whenStable();
    const panel = document.querySelector('#admin-menu-panel');
    const links = [...(panel?.querySelectorAll('a') ?? [])].map((a) => [a.textContent?.trim(), a.getAttribute('href')]);
    return { toggle, links };
  }

  it('lists Services for the Developer', async () => {
    const { links } = await open('u-developer');
    expect(links).toEqual([['Services', '/admin/services']]);
  });

  it('is not there for someone with no admin permission', async () => {
    const { toggle } = await open('u-welder');
    expect(toggle).toBeNull();
  });
});
