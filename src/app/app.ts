import { Component } from '@angular/core';
import { AppShell } from './shared/app-shell/app-shell';

@Component({
  selector: 'wt-root',
  imports: [AppShell],
  template: '<wt-app-shell />',
})
export class App {}
