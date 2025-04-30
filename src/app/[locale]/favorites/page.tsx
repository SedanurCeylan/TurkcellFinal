'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getFavoriteCoins } from '@/lib/coinApi';
import withAuth from '@/utils/withAuth';
import { Coin } from '../../../types/route';
import PageContainer from '@/components/PageContainer';
import EarnUp from '@/components/molecules/EarnUp';
import FavoritesHeader from '@/components/molecules/FavoritesHeader';
import Navbar from '../../../components/Navbar';

const FavoritesPage = () => {
    const t = useTranslations();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'price' | 'name' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const router = useRouter();

    useEffect(() => {
        const fetchFavorites = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                router.push('/login');
                return;
            }

            try {
                const userRef = doc(db, 'favorites', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setFavorites(userSnap.data().coins || []);
                }
            } catch (error) {
                console.error('Favoriler alınamadı:', error);
            }
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
        const fetchCoinData = async () => {
            try {
                const coinData = await getFavoriteCoins(favorites);
                setCoins(coinData);
            } catch (err) {
                console.error('Coin verileri alınamadı:', err);
            } finally {
                setLoading(false);
            }
        };

        if (favorites.length > 0) {
            fetchCoinData();
        } else {
            setCoins([]);
            setLoading(false);
        }
    }, [favorites]);

    const handleRemoveFavorite = async (slug: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'favorites', currentUser.uid);
            await updateDoc(userRef, {
                coins: arrayRemove(slug),
            });

            setFavorites((prev) => prev.filter((s) => s !== slug));
            setCoins((prev) => prev.filter((c) => c.slug !== slug));
        } catch (err) {
            console.error('Favoriden çıkarılamadı:', err);
        }
    };

    const handleSort = (key: 'price' | 'name') => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedCoins = coins
        .filter((coin) =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortKey) return 0;

            const aValue = sortKey === 'price' ? a.quote.USD.price : a.name.toLowerCase();
            const bValue = sortKey === 'price' ? b.quote.USD.price : b.name.toLowerCase();

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

    if (loading) return <div className="text-center my-5">{t('loading')}...</div>;

    return (
        <section>
            <Navbar />
            <PageContainer bgColor="bg-surface">
                <FavoritesHeader />
            </PageContainer>

            <div className="container mt-4 mb-7">
                <div className="row gy-4">
                    <div className="col-md-3">
                        <div className="rounded-4 px-4 py-3 ">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3 bg-primary rounded-5 text-white fw-semibold">
                                    {t('favorites_page_title')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-9">
                        <div className="rounded-4 p-4 bg-surface shadow-sm">
                            <h4 className="fw-semibold mb-3">{t('your_favorites')}</h4>

                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
                                <div className="position-relative w-100 te">
                                    <input
                                        type="text"
                                        placeholder={t('search_placeholder')}
                                        className="form-control pe-5"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button
                                            className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-secondary align-middle fs-3"
                                            onClick={() => setSearch('')}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>


                                <div className="btn-group">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handleSort('name')}
                                    >
                                        {t('sort_by_name')} {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handleSort('price')}
                                    >
                                        {t('sort_by_price')} {sortKey === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                                    </button>
                                </div>
                            </div>

                            {filteredAndSortedCoins.length === 0 ? (
                                <p className="text-muted">{t('no_favorites_found')}</p>
                            ) : (
                                <div className="table-responsive rounded-4">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>{t('image')}</th>
                                                <th>{t('name')}</th>
                                                <th>{t('symbol')}</th>
                                                <th>{t('price')}</th>
                                                <th>%24h</th>
                                                <th>{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAndSortedCoins.map((coin, index) => (
                                                <tr key={coin.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <img
                                                            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                                            alt={coin.name}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-circle"
                                                        />
                                                    </td>
                                                    <td>{coin.name}</td>
                                                    <td>{coin.symbol.toUpperCase()}</td>
                                                    <td>${coin.quote.USD.price.toFixed(2)}</td>
                                                    <td className={coin.quote.USD.percent_change_24h > 0 ? 'text-success' : 'text-danger'}>
                                                        {coin.quote.USD.percent_change_24h.toFixed(2)}%
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-link p-0"
                                                            onClick={() => handleRemoveFavorite(coin.slug)}
                                                        >
                                                            <i className="fas fa-star text-warning fa-lg"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PageContainer bgColor="bg-foto">
                <EarnUp />
            </PageContainer>
        </section>
    );
};

export default withAuth(FavoritesPage);
