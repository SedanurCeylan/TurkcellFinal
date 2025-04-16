import { DM_Sans } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import '@/styles/main.scss';
import Footer from '@/components/Footer';


const dmSans = DM_Sans({
    subsets: ['latin'],
    display: 'swap',
});

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>

            <body className={dmSans.className}>
                <NextIntlClientProvider>
                    <Navbar lang={locale} />
                    {children}
                    <Footer />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}