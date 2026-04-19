import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.toast--success]="t.variant === 'success'" [class.toast--error]="t.variant === 'error'" [class.toast--info]="t.variant === 'info'" role="status">
          <span class="toast-msg">{{ t.message }}</span>
          <button type="button" class="toast-close" (click)="toast.dismiss(t.id)" aria-label="Dismiss notification">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 4000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      font-size: 14px;
      line-height: 1.4;
      animation: toast-in 0.25s ease;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(12px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast-msg {
      flex: 1;
      min-width: 0;
    }

    .toast-close {
      flex-shrink: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0 2px;
      opacity: 0.65;
      color: inherit;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast--success {
      background: #e8f5e9;
      color: #1b5e20;
      border: 1px solid #a5d6a7;
    }

    .toast--error {
      background: #ffebee;
      color: #b71c1c;
      border: 1px solid #ffcdd2;
    }

    .toast--info {
      background: #e3f2fd;
      color: #0d47a1;
      border: 1px solid #90caf9;
    }
  `,
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);
}
