import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const defaultLocale = 'en';
const supportedLocales = ['en', 'ar', 'ku'] as const;

type SupportedLocale = (typeof supportedLocales)[number];

function resolveLocale(requestLocale?: string | null) {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  const candidate = cookieLocale || requestLocale || defaultLocale;
  return supportedLocales.includes(candidate as SupportedLocale)
    ? (candidate as SupportedLocale)
    : defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = resolveLocale(requestLocale);
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
