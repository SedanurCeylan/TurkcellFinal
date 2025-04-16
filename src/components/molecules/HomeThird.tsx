'use client';

import { useEffect, useState } from 'react';
import { fetchCoins } from '../../lib/coinApi';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const HomeThird = () => {
    const [coins, setCoins] = useState<any[]>([]);
    const t = useTranslations();

    useEffect(() => {
        const getCoins = async () => {
            try {
                const result = await fetchCoins(8);
                setCoins(result);
            } catch (err) {
                console.error('Coin verileri alınırken hata oluştu:', err);
            }
        };

        getCoins();
    }, []);

    return (
        <section className="container py-5">
            <h2 className="fw-bold mb-4">{t('market_title')}</h2>

            <div className="table-responsive rounded-4 shadow-sm">
                <table className="table table-hover">
                    <thead className="bg-light">
                        <tr>
                            <th>#</th>
                            <th>{t('market_name')}</th>
                            <th>{t('market_price')}</th>
                            <th>{t('market_change')}</th>
                            <th>{t('market_cap')}</th>
                            <th>{t('market_last7')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin, index) => (
                            <tr key={coin.id}>
                                <td>{index + 1}</td>
                                <td >
                                    <Image
                                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                        alt={coin.name}
                                        width={24}
                                        height={24}
                                        className="me-2"
                                    />
                                    <span>{coin.name} <small className="text-muted">{coin.symbol}</small></span>
                                </td>
                                <td>${coin.quote.USD.price.toFixed(2)}</td>
                                <td className={coin.quote.USD.percent_change_24h >= 0 ? 'text-success' : 'text-danger'}>
                                    {coin.quote.USD.percent_change_24h.toFixed(2)}%
                                </td>
                                <td>${Number(coin.quote.USD.market_cap).toLocaleString()}</td>
                                <td>
                                    <Image
                                        src={
                                            coin.quote.USD.percent_change_24h >= 0
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
                                        {t('market_trade')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default HomeThird;
