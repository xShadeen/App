import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION_MS = 3000;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<ToastItem[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, variant: ToastVariant = 'success', durationMs = DEFAULT_DURATION_MS): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, message, variant }]);
    window.setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
