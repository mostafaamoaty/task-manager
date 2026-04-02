import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-switcher.component.html',
})
export class LanguageSwitcherComponent {
  private translocoService = inject(TranslocoService);

  isOpen = signal(false);
  currentLang = signal(localStorage.getItem('lang') || 'en');

  langs = [
    { code: 'en', label: '🇺🇸 English' },
    { code: 'ar', label: '🇸🇦 العربية' },
  ];

  selectLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    this.isOpen.set(false);
  }
}
