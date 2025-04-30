'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import PageContainer from '@/components/PageContainer';
import EarnUp from '@/components/molecules/EarnUp';
import withAuth from '@/utils/withAuth';
import SellHeader from '@/components/molecules/BuyHeader';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { fetchCoins } from '@/lib/coinApi';
import { Coin, OwnedCoin } from '../../../types/route';
import Navbar from '../../../components/Navbar';
import { useSearchParams } from 'next/navigation';

const Sell = () => {
    const t = useTranslations();
    const [coinList, setCoinList] = useState<Coin[]>([]);
    const [walletCoins, setWalletCoins] = useState<OwnedCoin[]>([]);
    const [coinId, setCoinId] = useState('');
    const [coinAmount, setCoinAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [uid, setUid] = useState('');
    const [totalUSD, setTotalUSD] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');


    const searchParams = useSearchParams();


    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const uid = user.uid;
            setUid(uid);
            const docRef = doc(db, 'users', uid);
            const snap = await getDoc(docRef);
            const wallet = snap.data()?.wallet || {};
            setBalance(snap.data()?.balance || 0);

            const coins = await fetchCoins(100);
            setCoinList(coins);

            const owned: OwnedCoin[] = coins
                .filter((coin: Coin) => {
                    const item = wallet[String(coin.id)];
                    return item && item.amount > 0;
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

            const coinIdFromUrl = searchParams.get('coinId');
            if (coinIdFromUrl) setCoinId(coinIdFromUrl);
        };

        fetchData();
    }, []);


    useEffect(() => {
        const selectedCoin = coinList.find((c) => String(c.id) === coinId);
        const amountNum = parseFloat(coinAmount);
        if (selectedCoin && !isNaN(amountNum)) {
            const walletCoin = walletCoins.find((c) => String(c.id) === coinId);
            if (walletCoin && amountNum > walletCoin.amount) {
                setCoinAmount(walletCoin.amount.toFixed(6));
                setTotalUSD(walletCoin.amount * selectedCoin.quote.USD.price);
            } else if (amountNum < 0) {
                setCoinAmount('0');
                setTotalUSD(0);
            } else {
                setTotalUSD(amountNum * selectedCoin.quote.USD.price);
            }
        } else {
            setTotalUSD(0);
        }
    }, [coinId, coinAmount, coinList, walletCoins]);

    const handleSell = async () => {
        if (!coinId || !coinAmount) return alert(t('fill_all_fields'));

        const selectedCoin = coinList.find((c) => String(c.id) === coinId);
        const walletCoin = walletCoins.find((c) => String(c.id) === coinId);
        const amountNum = parseFloat(coinAmount);

        if (!selectedCoin || !walletCoin || isNaN(amountNum) || amountNum <= 0 || amountNum > walletCoin.amount) {
            alert(t('invalid_amount'));
            return;
        }

        const sellValue = amountNum * selectedCoin.quote.USD.price;

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        const updatedWallet = { ...(userData?.wallet || {}) };

        updatedWallet[coinId].amount -= amountNum;
        if (updatedWallet[coinId].amount <= 0) {
            delete updatedWallet[coinId];
        }

        const updatedBalance = (userData?.balance || 0) + sellValue;

        await updateDoc(docRef, {
            wallet: updatedWallet,
            balance: updatedBalance,
        });

        setBalance(updatedBalance);
        setWalletCoins(prev =>
            prev.map(c => {
                if (String(c.id) === coinId) {
                    return { ...c, amount: c.amount - amountNum };
                }
                return c;
            }).filter(c => c.amount !== 0 || c.amount === 0) // Tüm coinler kalsın
        );

        setSuccessMessage(`${t('sold_successfully')} $${sellValue.toFixed(2)}`);
        setTimeout(() => setSuccessMessage(''), 4000);

        setCoinId('');
        setCoinAmount('');
        setTotalUSD(0);
    };

    return (
        <section>
            <Navbar />
            <PageContainer bgColor="bg-surface">
                <SellHeader />
            </PageContainer>

            <div className="container mb-7">
                <div className="row">
                    <div className="col-md-3">
                        <div className="rounded-4 px-4 py-3">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/wallet" className="text-black text-decoration-none d-block">{t('Overview')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/buy" className="text-black text-decoration-none d-block">{t('buy_page_title')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3 bg-primary rounded-5 text-white">
                                    <Link href="/sell" className="text-white text-decoration-none d-block">{t('sell_page_title')}</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-9 border-start ps-4">
                        <div className="rounded-4 p-4 shadow-sm bg-surface">
                            <h4 className="mb-4 fw-semibold">{t('sell_crypto')}</h4>

                            <div className="alert alert-light bg-white border rounded-4 shadow-sm d-flex align-items-center gap-2">
                                💰 <strong className="me-2">{t('your_balance')}:</strong>
                                <span className="fw-semibold text-primary">${balance.toFixed(2)}</span>
                            </div>

                            {successMessage && (
                                <div className="alert alert-success d-flex align-items-center mt-3 rounded-4" role="alert">
                                    ✅ {successMessage}
                                </div>
                            )}

                            <div className="row g-4 mt-3 align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">{t('select_coin')}</label>
                                    <select
                                        className="form-select rounded-4"
                                        value={coinId}
                                        onChange={(e) => setCoinId(e.target.value)}
                                    >
                                        <option value="">{t('choose')}</option>
                                        {walletCoins.map((coin) => (
                                            <option
                                                key={coin.id}
                                                value={String(coin.id)}
                                                disabled={coin.amount <= 0}
                                            >
                                                {coin.name} ({coin.symbol.toUpperCase()}) – {parseFloat(coin.amount.toFixed(4))} {t('available')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">{t('amount')}</label>
                                    <input
                                        className="form-control rounded-4"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={coinAmount}
                                        onChange={(e) => setCoinAmount(e.target.value)}
                                    />
                                </div>

                                {totalUSD > 0 && (
                                    <div className="col-12 text-success mt-2">
                                        <p className="fw-semibold fs-5"><strong>{t('you_will_earn')}:</strong> ${totalUSD.toFixed(2)}</p>
                                    </div>
                                )}

                                <div className="col-12 d-flex justify-content-end">
                                    <button
                                        className="btn btn-primary rounded-5 px-4 py-2 text-white"
                                        onClick={handleSell}
                                        disabled={!coinId || !coinAmount}
                                    >
                                        {t('sell_now')}
                                    </button>
                                </div>
                            </div>

                            {walletCoins.length > 0 && (
                                <div className="mt-5">
                                    <h5 className="mb-4 fw-semibold">{t('your_coins')}</h5>
                                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                        <ul className="list-group">
                                            {walletCoins.map((coin) => (
                                                <li
                                                    key={coin.id}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <strong>{coin.name} ({coin.symbol.toUpperCase()})</strong>
                                                        <div className="text-muted small">
                                                            {parseFloat(coin.amount.toFixed(6))} × ${coin.quote.USD.price.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <span className="fw-bold text-success">
                                                        ${(coin.amount * coin.quote.USD.price).toFixed(2)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
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

export default withAuth(Sell);
