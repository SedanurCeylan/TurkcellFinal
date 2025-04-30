'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import FavoriteStar from '../atoms/FavoriteStar';
import { onAuthStateChanged } from 'firebase/auth';
import withAuth from '@/utils/withAuth';
import { getCoins } from '@/lib/coinApi';
import { Coin } from '@/types/route';
import Link from 'next/link';

type SortKey = 'price' | 'change' | 'name';

const MarketProduct = () => {
    const t = useTranslations();
    const [coins, setCoins] = useState<Coin[]>([]);
    const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
            const data = await getCoins();
            setCoins(data);
            setFilteredCoins(data);
        };
        fetchCoins();
    }, []);

    useEffect(() => {
        let filtered = coins.filter((coin) =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        );

        if (sortKey) {
            filtered = [...filtered].sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                switch (sortKey) {
                    case 'price':
                        aValue = a.quote.USD.price;
                        bValue = b.quote.USD.price;
                        break;
                    case 'change':
                        aValue = a.quote.USD.percent_change_24h;
                        bValue = b.quote.USD.percent_change_24h;
                        break;
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    default:
                        return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }

                return 0;
            });
        }

        setFilteredCoins(filtered);
    }, [search, coins, sortKey, sortOrder]);

    const toggleFavorite = async (slug: string, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userRef = doc(db, 'favorites', currentUser.uid);
        const isFavorite = favorites.includes(slug);

        try {
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                await setDoc(userRef, { coins: [slug] });
            } else {
                await updateDoc(userRef, {
                    coins: isFavorite ? arrayRemove(slug) : arrayUnion(slug),
                });
            }

            setFavorites((prevFavorites) =>
                isFavorite
                    ? prevFavorites.filter((id) => id !== slug)
                    : [...prevFavorites, slug]
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Favori güncellenirken hata:', error.message);
            } else {
                console.error('Favori güncellenirken bilinmeyen bir hata oluştu.');
            }
        }
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const renderArrow = (key: SortKey) => {
        return (
            <span>
                {sortKey === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
            </span>
        );
    };

    return (
        <div className="container py-4">
            <div className="mb-3 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control w-100 w-md-25"
                />
            </div>

            <div className="table-responsive rounded-4 shadow-sm">
                <table className="table align-middle text-center mb-0 bg-white">
                    <thead className="bg-light">
                        <tr>
                            <th></th>
                            <th>#</th>
                            <th
                                role="button"
                                onClick={() => handleSort('name')}
                                style={{ cursor: 'pointer' }}
                            >
                                {t('market_page_pair')}
                                {renderArrow('name')}
                            </th>
                            <th
                                role="button"
                                onClick={() => handleSort('price')}
                                style={{ cursor: 'pointer' }}
                            >
                                {t('market_page_last')}
                                {renderArrow('price')}
                            </th>
                            <th
                                role="button"
                                onClick={() => handleSort('change')}
                                style={{ cursor: 'pointer' }}
                            >
                                {t('market_page_change')}
                                {renderArrow('change')}
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoins.map((coin: Coin, index) => (
                            <tr key={coin.id}>
                                <td>
                                    <button
                                        className="btn btn-link p-0"
                                        onClick={(e) => toggleFavorite(coin.slug, e)}
                                        title="Favorilere ekle / çıkar"
                                    >
                                        <FavoriteStar
                                            key={coin.slug + favorites.join(',')}
                                            coinId={coin.slug}
                                            favorites={favorites}
                                        />
                                    </button>
                                </td>
                                <td>{index + 1}</td>
                                <td className="text-start">
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                            alt={coin.name}
                                            width={24}
                                            height={24}
                                        />
                                        <div>
                                            <div>{coin.name}</div>
                                            <small className="text-muted">{coin.symbol.toUpperCase()}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${coin.quote.USD.price.toFixed(2)}</td>
                                <td
                                    className={
                                        coin.quote.USD.percent_change_24h > 0
                                            ? 'text-success'
                                            : 'text-danger'
                                    }
                                >
                                    {coin.quote.USD.percent_change_24h.toFixed(2)}%
                                </td>
                                <td>
                                    <Link
                                        href={`/buy?coinId=${coin.id}`}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        {t('market_page_action')}
                                    </Link>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default withAuth(MarketProduct);
