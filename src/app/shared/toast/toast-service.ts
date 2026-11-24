import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail?: string;
}

/** Short messages that go away by themselves ("Saved Welding"), copied from the weld demo. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly current = signal<readonly ToastMessage[]>([]);

  readonly messages = this.current.asReadonly();

  add(opts: { severity: ToastSeverity; summary: string; detail?: string; life?: number }): void {
    const id = ++this.seq;
    this.current.update((m) => [...m, { id, severity: opts.severity, summary: opts.summary, detail: opts.detail }]);
    setTimeout(() => this.dismiss(id), opts.life ?? 4000);
  }

  dismiss(id: number): void {
    this.current.update((m) => m.filter((x) => x.id !== id));
  }
}
