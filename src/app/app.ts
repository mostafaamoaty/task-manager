import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from './shared/components/language-switcher/language-switcher.component';
import { ErrorService } from './core/services/error.service';
import { UiEventService } from './core/services/ui-event.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoDirective, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private errorService = inject(ErrorService);
  private transloco = inject(TranslocoService);
  private uiEventService = inject(UiEventService);
  private router = inject(Router);

  isDark = signal(false);
  error = this.errorService.error;
  ngOnInit(): void {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    this.isDark.set(savedDark);
    this.applyDarkMode(savedDark);

    const savedLang = localStorage.getItem('lang') || 'en';
    this.transloco.setActiveLang(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }

  toggleDark(): void {
    const newVal = !this.isDark();
    this.isDark.set(newVal);
    localStorage.setItem('darkMode', String(newVal));
    this.applyDarkMode(newVal);
  }

  openNewTask(): void {
    this.uiEventService.triggerCreateTask();
    this.router.navigate(['/tasks']);
  }

  private applyDarkMode(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getErrorMessage(key: string | null): string {
    if (!key) return '';
    return this.transloco.translate(key);
  }
}
