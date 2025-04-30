'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import PageContainer from '@/components/PageContainer';
import EarnUp from '@/components/molecules/EarnUp';
import withAuth from '@/utils/withAuth';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { fetchCoins } from '@/lib/coinApi';
import { Coin, OwnedCoin } from '../../../types/route';
import Link from 'next/link';
import WalletHeader from '@/components/molecules/WalletHeader';

const Wallet = () => {
    const t = useTranslations();
    const [walletCoins, setWalletCoins] = useState<OwnedCoin[]>([]);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const uid = user.uid;
            const docRef = doc(db, 'users', uid);
            const snap = await getDoc(docRef);
            const wallet = snap.data()?.wallet || {};
            setBalance(snap.data()?.balance || 0);

            const coins = await fetchCoins(100);
            const owned: OwnedCoin[] = coins
                .filter((coin: Coin) => {
                    const walletItem = wallet[String(coin.id)];
                    return walletItem && walletItem.amount > 0;
                })
                .map((coin: Coin) => {
                    const walletItem = wallet[String(coin.id)];
                    return {
                        ...coin,
                        amount: walletItem?.amount ?? 0,
                        priceAtPurchase: walletItem?.priceAtPurchase ?? 0,
                    };
                });

            setWalletCoins(owned);
        };
        fetchData();
    }, []);

    return (
        <section>
            <Navbar />
            <PageContainer bgColor="bg-surface">
                <WalletHeader />
            </PageContainer>

            <div className="container mb-7 px-3 px-md-5 py-5">
                <div className="row gy-5">
                    <div className="col-12 col-md-3">
                        <div className="rounded-4 px-4 py-3">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3 bg-primary rounded-5 text-white">
                                    <Link href="/wallet" className="text-white text-decoration-none d-block">{t('Overview')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/buy" className="text-black text-decoration-none d-block">{t('buy_page_title')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/sell" className="text-black text-decoration-none d-block">{t('sell_page_title')}</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-12 col-md-9 border-start bg-white ps-4">
                        <div className="alert alert-light border shadow-sm rounded-4 d-flex align-items-center gap-2">
                            💰 <strong className="me-2">{t('your_balance')}:</strong>
                            <span className="fw-semibold text-primary">${balance.toFixed(2)}</span>
                        </div>

                        <div className="rounded-4 p-4 shadow-sm bg-surface mt-4">
                            <h4 className="mb-4 fw-semibold">{t('your_coins')}</h4>

                            {walletCoins.length > 0 ? (
                                <div
                                    style={{ maxHeight: '400px', overflowY: 'auto' }} // scroll istersen aç
                                >
                                    <ul className="list-group">
                                        {walletCoins.map((coin) => (
                                            <li
                                                key={coin.id}
                                                className="list-group-item d-flex justify-content-between align-items-center rounded-3 shadow-sm mb-3 px-3 py-3"
                                            >
                                                <div>
                                                    <strong>{coin.name} ({coin.symbol.toUpperCase()})</strong>
                                                    <div className="text-muted small">
                                                        {parseFloat(coin.amount.toFixed(6))} × ${coin.quote.USD.price.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-success mb-1">
                                                        ${(coin.amount * coin.quote.USD.price).toFixed(2)} USD
                                                    </div>
                                                    <Link
                                                        href={`/sell?coinId=${coin.id}`}
                                                        className="btn btn-sm btn-outline-primary rounded-5"
                                                    >
                                                        {t('sell_now')}
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-muted">{t('no_coins')}</p>
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

export default withAuth(Wallet);
