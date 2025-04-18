'use client';

import { useEffect, useState } from 'react';
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

const Sell = () => {
    const t = useTranslations();
    const [coinList, setCoinList] = useState<Coin[]>([]);
    const [walletCoins, setWalletCoins] = useState<OwnedCoin[]>([]);
    const [coinId, setCoinId] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [uid, setUid] = useState('');
    const [calculatedUSD, setCalculatedUSD] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

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

            const coins = await fetchCoins();
            setCoinList(coins);

            const owned: OwnedCoin[] = coins
                .filter((coin) => {
                    const walletItem = wallet[String(coin.id)];
                    return walletItem && walletItem.amount > 0;
                })
                .map((coin) => {
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

    useEffect(() => {
        if (!coinId || !amount) return;

        const selectedCoin = coinList.find((c) => String(c.id) === coinId);
        if (selectedCoin) {
            const price = selectedCoin.quote.USD.price;
            const usdValue = Number(amount) * price;
            setCalculatedUSD(Number(usdValue.toFixed(2)));
        }
    }, [coinId, amount, coinList]);

    const handleSell = async () => {
        if (!uid || !coinId || !amount) return;

        const selectedCoin = coinList.find((c) => String(c.id) === coinId);
        if (!selectedCoin) return;

        const coinAmountInWallet = walletCoins.find((c) => String(c.id) === coinId)?.amount || 0;
        if (Number(amount) > coinAmountInWallet) {
            alert(t('sell_not_enough'));
            return;
        }

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();

        const updatedWallet = { ...(userData?.wallet || {}) };
        updatedWallet[coinId].amount -= Number(amount);
        if (updatedWallet[coinId].amount <= 0) {
            delete updatedWallet[coinId];
        }

        const usdValue = Number(amount) * selectedCoin.quote.USD.price;
        const updatedBalance = (userData?.balance || 0) + usdValue;

        await updateDoc(docRef, {
            wallet: updatedWallet,
            balance: updatedBalance,
        });

        setSuccessMessage(t('sell_success'));
        setAmount('');
        setCoinId('');
        setCalculatedUSD(0);
    };

    return (
        <section className="mb-3">
            <PageContainer bgColor="bg-surface">
                <SellHeader />
            </PageContainer>

            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <div className="rounded-4 px-4 py-3 bg-light">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3">{t('Overview')}</li>
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/buy" className="text-dark text-decoration-none">
                                        {t('buy_cripto')}
                                    </Link>
                                </li>
                                <li className="list-group-item border-0 ps-3 bg-primary rounded-5 text-white">
                                    {t('sell_cripto')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-9">
                        <div className="p-4 rounded-4 bg-light">
                            <h2>{t('sell_cripto')}</h2>

                            <div className="mb-3">
                                <label className="form-label">{t('select_coin')}</label>
                                <select
                                    className="form-select"
                                    value={coinId}
                                    onChange={(e) => setCoinId(e.target.value)}
                                >
                                    <option value="">{t('select_coin')}</option>
                                    {walletCoins.map((coin) => (
                                        <option key={coin.id} value={coin.id}>
                                            {coin.name} ({coin.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {coinId && (
                                <p className="text-muted">
                                    {t('available')}: {walletCoins.find((c) => String(c.id) === coinId)?.amount}
                                </p>
                            )}

                            <div className="mb-3">
                                <label className="form-label">{t('amount')}</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                />
                            </div>

                            {calculatedUSD > 0 && (
                                <p>
                                    {t('estimated_value')}: ${calculatedUSD.toLocaleString()}
                                </p>
                            )}

                            <button onClick={handleSell} className="btn btn-primary mt-2">
                                {t('sell_button')}
                            </button>

                            {successMessage && <p className="text-success mt-2">{successMessage}</p>}
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
