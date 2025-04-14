'use client';

import { startTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = ({ lang }: { lang: string }) => {
  const t = useTranslations();
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
    <nav className="navbar navbar-expand-lg bg-white shadow-sm py-2 px-4">
      <div className="container-fluid">
        {/* Logo ve Marka */}
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <Image src="/images/logo.svg" alt="Logo" width={32} height={32} className="img-fluid" />
          <strong>Rocket</strong>
        </Link>

        {/* Toggler Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* İçerik */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* Sol Menü */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex align-items-lg-center gap-lg-3">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                {t('nav_homepage')}
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Homepage 1</a></li>
                <li><a className="dropdown-item" href="#">Homepage 2</a></li>
              </ul>
            </li>
            <li className="nav-item"><a className="nav-link" href="#">{t('nav_buy')}</a></li>
            <li className="nav-item"><a className="nav-link" href="#">{t('nav_market')}</a></li>
            <li className="nav-item"><a className="nav-link" href="#">{t('nav_exchange')}</a></li>
            <li className="nav-item"><a className="nav-link" href="#">{t('nav_spot')}</a></li>
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-1" href="#">
                {t('nav_bit')}
                <Image src="/images/bit.svg" alt="bit" width={10} height={10} />
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                {t('nav_pages')}
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">About</a></li>
                <li><a className="dropdown-item" href="#">Contact</a></li>
              </ul>
            </li>
          </ul>

          {/* Sağ Menü */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-lg-0">
            {/* Diller */}
            <div className="btn-group" role="group">
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

            {/* Dropdownlar */}
            <div className="dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                {t('nav_assets')}
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Assets</a></li>
              </ul>
            </div>

            <div className="dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                {t('nav_order')}
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Orders</a></li>
              </ul>
            </div>

            <div className="dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                EN/USD
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">TR/TRY</a></li>
              </ul>
            </div>

            {/* Butonlar ve Avatar */}
            <button className="btn btn-link p-1">
              <Image src="/images/gunes.svg" alt="theme" width={16} height={16} />
            </button>
            <button className="btn btn-link p-1">
              <Image src="/images/zil.svg" alt="notification" width={16} height={16} />
            </button>

            <button className="btn btn-outline-dark rounded-pill px-3">{t('nav_wallet')}</button>

            <Image
              src="/images/avatar.jpeg"
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-circle"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
