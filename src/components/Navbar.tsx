'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const Navbar = ({ lang }: { lang: string }) => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <nav className="p-4 bg-light d-flex gap-4">
      <Link href={`/${lang}`}>{t('home')}</Link>
      <Link href={`/${lang}/market`}>{t('market')}</Link>
    </nav>
  );
};

export default Navbar;
