import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { getTranslocoTestingProvider } from '../../../../test-helpers/transloco-testing';

describe('LanguageSwitcherComponent', () => {
  const providers = [
    provideHttpClient(),
    provideHttpClientTesting(),
    getTranslocoTestingProvider(),
  ];

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the language toggle button', async () => {
    await render(LanguageSwitcherComponent, { providers });
    // Button shows current lang label
    const btn = screen.getByRole('button', { hidden: true });
    expect(btn).toBeTruthy();
  });

  it('opens the language list on button click', async () => {
    const user = userEvent.setup();
    await render(LanguageSwitcherComponent, { providers });
    await user.click(screen.getByRole('button', { hidden: true }));
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('calls setActiveLang when a language is selected', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LanguageSwitcherComponent, { providers });
    const translocoService = fixture.debugElement.injector.get(TranslocoService);
    const spy = vi.spyOn(translocoService, 'setActiveLang');

    await user.click(screen.getByRole('button', { hidden: true }));
    const arBtn = screen.getByText('🇸🇦 العربية');
    await user.click(arBtn);

    expect(spy).toHaveBeenCalledWith('ar');
  });

  it('sets dir=rtl on html element when Arabic is selected', async () => {
    const user = userEvent.setup();
    await render(LanguageSwitcherComponent, { providers });

    await user.click(screen.getByRole('button', { hidden: true }));
    await user.click(screen.getByText('🇸🇦 العربية'));

    expect(document.documentElement.dir).toBe('rtl');
  });

  it('sets dir=ltr when English is selected', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LanguageSwitcherComponent, { providers });
    // Set to Arabic first
    fixture.componentInstance.selectLang('ar');

    await user.click(screen.getByRole('button', { hidden: true }));
    await user.click(screen.getByText('🇺🇸 English'));

    expect(document.documentElement.dir).toBe('ltr');
  });

  it('persists selected language to localStorage', async () => {
    const user = userEvent.setup();
    await render(LanguageSwitcherComponent, { providers });

    await user.click(screen.getByRole('button', { hidden: true }));
    await user.click(screen.getByText('🇸🇦 العربية'));

    expect(localStorage.getItem('lang')).toBe('ar');
  });
});
