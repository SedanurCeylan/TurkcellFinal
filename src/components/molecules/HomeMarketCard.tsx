'use client';

import { useEffect, useState } from 'react';
import { fetchCoins } from '@/lib/coinApi';
import Image from 'next/image';

const HomeSecond = () => {
    const [coins, setCoins] = useState<any[]>([]);

    useEffect(() => {
        const getCoins = async () => {
            try {
                const result = await fetchCoins(4);
                setCoins(result);
            } catch (err) {
                console.error('Coin verisi alınamadı:', err);
            }
        };

        getCoins();
    }, []);

    const categories = [

        'Crypto',
        'DeFi',
        'BSC',
        'NFT',
        'Metaverse',
        'Polkadot',
        'Solana',
        'Opensea',
        'Makersplace',
    ];

    return (
        <div className="container cardlar bg-white rounded-4 p-4">
            <div className="d-flex gap-4 mb-4 flex-wrap">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        className={`btn btn-sm rounded-pill px-4 py-2 ${index === 0 ? 'btn-primary text-white' : 'btn-outline-dark'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <hr className="mt-0" />

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {coins.map((coin: any, index: number) => (
                    <div key={coin.id} className="col">
                        <div
                            className={`p-4 h-100 d-flex flex-column justify-content-between ${index === 1 ? 'rounded-3 shadow-lg' : 'rounded-3 bg-white'
                                }`}
                        >
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Image
                                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                    alt={coin.name}
                                    width={24}
                                    height={24}
                                />
                                <strong>{coin.name}</strong>
                                <small className="text-muted">{coin.symbol}/USD</small>
                            </div>
                            <div className="mb-2">
                                <h4 className="fw-bold mb-1">USD {coin.quote.USD.price.toFixed(2)}</h4>
                                <div className="d-flex align-items-center gap-2">
                                    <small className="text-muted">36,641.20</small>
                                    <span
                                        className={`badge fw-semibold ${coin.quote.USD.percent_change_24h >= 0 ? 'bg-success' : 'bg-danger'
                                            }`}
                                    >
                                        {coin.quote.USD.percent_change_24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeSecond;
