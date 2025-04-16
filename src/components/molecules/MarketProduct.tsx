'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import FavoriteStar from '../../components/atoms/FavoriteStar';
import { onAuthStateChanged } from 'firebase/auth';



type SortKey = 'name' | 'symbol' | 'current_price' | 'price_change_percentage_24h' | 'high_24h' | 'low_24h' | 'total_volume';

const MarketProduct = () => {
    const t = useTranslations();
    const [coins, setCoins] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('current_price');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [favorites, setFavorites] = useState<string[]>([]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, 'favorites', currentUser.uid);
                const userSnap = await getDoc(docRef);
                if (userSnap.exists()) {
                    setFavorites(userSnap.data().coins || []);
                }
            }
        });

        return () => unsubscribe();
    }, []);



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
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (key: SortKey) => {
        if (key !== sortKey) {
            return <i className="fas fa-sort fa-xs ms-1 text-secondary" />;
        }

        return (
            <i
                className={`fas ${sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} fa-xs ms-1`}
            />
        );
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

    const toggleFavorite = async (coinId: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userRef = doc(db, 'favorites', currentUser.uid);
        const isFavorite = favorites.includes(coinId);

        try {
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    coins: [coinId],
                });
            } else {
                await updateDoc(userRef, {
                    coins: isFavorite ? arrayRemove(coinId) : arrayUnion(coinId),
                });
            }

            setFavorites((prev) =>
                isFavorite ? prev.filter((id) => id !== coinId) : [...prev, coinId]
            );
        } catch (error) {
            console.error('Favori güncellenirken hata oluştu:', error);
        }
    };
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
                <table className="table table-hover align-middle text-center">
                    <thead className="bg-light">
                        <tr>
                            <th> </th>
                            <th>#</th>
                            <th onClick={() => handleSort('name')} role="button">
                                {t('market_page_pair')}{renderSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('current_price')} role="button">
                                {t('market_page_last')}{renderSortIcon('current_price')}
                            </th>
                            <th onClick={() => handleSort('price_change_percentage_24h')} role="button">
                                {t('market_page_change')}{renderSortIcon('price_change_percentage_24h')}
                            </th>
                            <th onClick={() => handleSort('high_24h')} role="button">
                                {t('market_page_high')}{renderSortIcon('high_24h')}
                            </th>
                            <th onClick={() => handleSort('low_24h')} role="button">
                                {t('market_page_low')}{renderSortIcon('low_24h')}
                            </th>
                            <th onClick={() => handleSort('total_volume')} role="button">
                                {t('market_page_turnover')}{renderSortIcon('total_volume')}
                            </th>
                            <th>{t('market_page_chart')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoins.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-muted py-5">{t('market_page_no_data')}</td>
                            </tr>
                        ) : (
                            filteredCoins.map((coin, index) => {
                                const change = coin.price_change_percentage_24h;
                                const turnover = (coin.total_volume / 1_000_000_000).toFixed(2);

                                return (
                                    <tr key={coin.id} className={index === 1 ? 'bg-primary-subtle' : ''}>
                                        <td>
                                            <button
                                                onClick={() => toggleFavorite(coin.id)}
                                                className="btn btn-link p-0 border-0"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FavoriteStar
                                                    key={`${coin.id}-${favorites.length}`}
                                                    coinId={coin.id}
                                                    favorites={favorites}
                                                />

                                            </button>
                                        </td>

                                        <td>{index + 1}</td>
                                        <td className="d-flex align-items-center gap-2">
                                            <img src={coin.image} alt={coin.name} width={24} height={24} />
                                            <div className="text-start">
                                                <div>{coin.name}</div>
                                                <small className="text-muted">{coin.symbol.toUpperCase()}</small>
                                            </div>
                                        </td>
                                        <td>${coin.current_price}</td>
                                        <td className={change > 0 ? 'text-success' : 'text-danger'}>
                                            {change.toFixed(2)}%
                                        </td>
                                        <td>${coin.high_24h}</td>
                                        <td>${coin.low_24h}</td>
                                        <td>{turnover}B USD</td>
                                        <td>
                                            <img
                                                src={
                                                    change >= 0
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
