import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private _error = signal<string | null>(null);
  error = this._error.asReadonly();

  setError(messageKey: string): void {
    this._error.set(messageKey);
    setTimeout(() => this._error.set(null), 5000);
  }

  clearError(): void {
    this._error.set(null);
  }
}
