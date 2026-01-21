import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';

const rtlLocales = new Set(['ar', 'ku']);

const languageOptions = [
  { value: 'en', labelKey: 'language.english' },
  { value: 'ar', labelKey: 'language.arabic' },
  { value: 'ku', labelKey: 'language.kurdish' }
];

export default function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations('common');
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const cookieLocale = Cookies.get('NEXT_LOCALE');
    setLocale(cookieLocale || document.documentElement.lang || 'en');
  }, []);

  const options = useMemo(
    () =>
      languageOptions.map((option) => ({
        ...option,
        label: t(option.labelKey)
      })),
    [t]
  );

  const handleLocaleChange = (nextLocale: string) => {
    if (!nextLocale || nextLocale === locale) return;
    Cookies.set('NEXT_LOCALE', nextLocale, { expires: 365, sameSite: 'lax' });
    const nextDir = rtlLocales.has(nextLocale) ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextDir;
    setLocale(nextLocale);
    router.replace(router.asPath, undefined, { scroll: false });
  };

  return (
    <div className={className}>
      <label className="sr-only" htmlFor="language-select">
        {t('language.label')}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
