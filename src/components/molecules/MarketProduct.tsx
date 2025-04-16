'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type SortKey = 'name' | 'symbol' | 'current_price' | 'price_change_percentage_24h' | 'high_24h' | 'low_24h' | 'total_volume';

const MarketProduct = () => {
    const t = useTranslations();
    const [coins, setCoins] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('current_price');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const res = await fetch(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h'
                );
                const data = await res.json();
                setCoins(data);
            } catch (error) {
                console.error('Veri çekme hatası:', error);
            }
        };

        fetchCoins();
    }, []);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredCoins = coins
        .filter(
            (coin) =>
                coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="container py-4">
            <input
                type="text"
                className="form-control mb-3"
                placeholder={t('market_page_search') || 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="table-responsive rounded-4 shadow-sm">
                <table className="table table-hover">
                    <thead className="bg-light">
                        <tr>
                            <th>#</th>
                            <th onClick={() => handleSort('name')} role="button">
                                {t('market_page_pair')}
                            </th>
                            <th onClick={() => handleSort('current_price')} role="button">
                                {t('market_page_last')}
                            </th>
                            <th onClick={() => handleSort('price_change_percentage_24h')} role="button">
                                {t('market_page_change')}
                            </th>
                            <th onClick={() => handleSort('high_24h')} role="button">
                                {t('market_page_high')}
                            </th>
                            <th onClick={() => handleSort('low_24h')} role="button">
                                {t('market_page_low')}
                            </th>
                            <th onClick={() => handleSort('total_volume')} role="button">
                                {t('market_page_turnover')}
                            </th>
                            <th>{t('market_page_chart')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoins.length === 0 ? (
                            <tr>
                                <td colSpan={9}>{t('market_page_no_data')}</td>
                            </tr>
                        ) : (
                            filteredCoins.map((coin, index) => {
                                const change = coin.price_change_percentage_24h;
                                const turnover = (coin.total_volume / 1_000_000_000).toFixed(2);

                                return (
                                    <tr key={coin.id} className={index === 1 ? 'bg-primary-subtle' : ''}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img className="me-2" src={coin.image} alt={coin.name} width={20} />
                                            {coin.name}
                                            <small className="text-muted">{coin.symbol.toUpperCase()}</small>
                                        </td>
                                        <td>{coin.current_price}</td>
                                        <td className={change > 0 ? 'text-success' : 'text-danger'}>
                                            {change.toFixed(2)}%
                                        </td>
                                        <td>{coin.high_24h}</td>
                                        <td>{coin.low_24h}</td>
                                        <td>{turnover}B (USD)</td>
                                        <td>
                                            <img
                                                src={
                                                    coin.price_change_percentage_24h >= 0
                                                        ? '/images/chartGreen.png'
                                                        : '/images/chartRed.png'
                                                }
                                                alt="chart"
                                                width={136}
                                                height={29}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-outline-primary btn-sm">
                                                {t('market_page_action')}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketProduct;
