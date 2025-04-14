'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const Footer = () => {
  const t = useTranslations('');

  return (
    <footer className="bg-light text-dark pt-5 border-top">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '1.5rem' }}>🔷</span>
              <span className="h5 mb-0">Rocket</span>
            </div>
            <p className="fw-semibold">{t('contact_title')}</p>
            <p>+98 902 353 2926</p>
            <p>Sinahosseini379@Gmail.Com</p>
            <p className="text-muted small">{t('copyright')}</p>
          </div>

          <div className="col-12 col-md-8">
            <div className="row row-cols-2 row-cols-md-4 g-4">
              <div>
                <h6 className="fw-bold">{t('products_title')}</h6>
                <ul className="list-unstyled">
                  <li>{t('products_spot')}</li>
                  <li>{t('products_inverse')}</li>
                  <li>{t('products_usdt')}</li>
                  <li>{t('products_exchange')}</li>
                  <li>{t('products_launchpad')}</li>
                  <li>{t('products_binance')}</li>
                </ul>
              </div>
              <div>
                <h6 className="fw-bold">{t('services_title')}</h6>
                <ul className="list-unstyled">
                  <li>{t('services_buy')}</li>

                  <li>{t('services_markets')}</li>
                  <li>{t('services_fee')}</li>
                  <li>{t('services_affiliate')}</li>
                  <li>{t('services_referral')}</li>
                  <li>{t('services_api')}</li>
                </ul>
              </div>
              <div>
                <h6 className="fw-bold">{t('support_title')}</h6>
                <ul className="list-unstyled">
                  <li>{t('support_learn')}</li>
                  <li>{t('support_help')}</li>
                  <li>{t('support_feedback')}</li>
                  <li>{t('support_submit')}</li>
                  <li>{t('support_docs')}</li>
                  <li>{t('support_rules')}</li>
                </ul>
              </div>
              <div>
                <h6 className="fw-bold">{t('about_title')}</h6>
                <ul className="list-unstyled">
                  <li>{t('about')}</li>
                  <li>{t('about_auth')}</li>
                  <li>{t('about_careers')}</li>
                  <li>{t('about_contacts')}</li>
                  <li>{t('about_blog')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-4 mt-4">
          <p className="mb-2 mb-md-0 text-muted small">
            {t('copyright')}
          </p>
          <div className="d-flex gap-3">
            <a href="#">
              <Image src="/images/facebook.svg" alt="Facebook" width={16} height={16} />
            </a>
            <a href="#">
              <Image src="/images/twitter.svg" alt="Twitter" width={16} height={16} />
            </a>
            <a href="#">
              <Image src="/images/instagram.svg" alt="Instagram" width={16} height={16} />
            </a>
            <a href="#">
              <Image src="/images/linkedin.svg" alt="LinkedIn" width={16} height={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
