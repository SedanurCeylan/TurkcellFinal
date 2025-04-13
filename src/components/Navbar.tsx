'use client';

import { startTransition, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const Navbar = ({ lang }: { lang: string }) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();



  const changeLanguage = (locale: string) => {
    const segments = pathname.split('/');
    segments[1] = locale;

    startTransition(() => {
      router.push(segments.join('/'));
    });
  };


  return (
    <nav className="p-4 bg-light d-flex gap-4">
      <div className="d-flex gap-2 align-items-center">
        <button
          onClick={() => changeLanguage('en')}
          className={`btn btn-sm ${currentLocale === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('tr')}
          className={`btn btn-sm ${currentLocale === 'tr' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          TR
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
