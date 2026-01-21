import Document, { Html, Head, Main, NextScript, type DocumentContext } from 'next/document';

const defaultLocale = 'en';
const rtlLocales = ['ar', 'ku'];

const getLocaleFromCookieString = (cookieHeader?: string) => {
  if (!cookieHeader) return undefined;
  const cookiePairs = cookieHeader.split(';');
  for (const pair of cookiePairs) {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (rawKey === 'NEXT_LOCALE') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

export default class DocumentPage extends Document<{ locale: string; dir: 'ltr' | 'rtl' }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const cookieLocale = getLocaleFromCookieString(ctx.req?.headers.cookie);
    const locale = cookieLocale || defaultLocale;
    const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

    return {
      ...initialProps,
      locale,
      dir
    };
  }

  render() {
    const { locale, dir } = this.props;

    return (
      <Html lang={locale || defaultLocale} dir={dir}>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta charSet="utf-8" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}