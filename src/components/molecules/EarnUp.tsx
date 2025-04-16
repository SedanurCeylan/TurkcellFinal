

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const HomeEighth = () => {
    const t = useTranslations('');

    return (
        <div className='d-flex align-items-center justify-content-between py-4'>
            <div>
                <h3 className='fs-32 text-white'>{t('earnUp_title')}</h3>
                <p className='fs-4 text-white'>{t('earnUp_desc')}</p>
            </div>
            <div>
                <button>
                    {t('earnUp_btn')}
                </button>
            </div>
        </div>
    )
};

export default HomeEighth;
