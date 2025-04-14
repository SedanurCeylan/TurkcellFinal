// next.config.ts

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Gerekli tüm ayarları buraya yaz
const nextConfig: NextConfig = {
    images: {
        domains: ['s2.coinmarketcap.com'],
    },
};

export default withNextIntl(nextConfig);
