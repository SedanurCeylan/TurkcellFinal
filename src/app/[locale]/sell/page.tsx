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

const Sell = () => {
    const t = useTranslations();
    const [coinList, setCoinList] = useState<Coin[]>([]);
    const [walletCoins, setWalletCoins] = useState<OwnedCoin[]>([]);
    const [coinId, setCoinId] = useState('');
    const [coinAmount, setCoinAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [uid, setUid] = useState('');
    const [totalUSD, setTotalUSD] = useState(0);
    const [cart, setCart] = useState<{ id: string; name: string; symbol: string; amount: number; price: number }[]>([]);
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

    const addToCart = () => {
        const selectedCoin = coinList.find((c) => String(c.id) === coinId);
        const walletCoin = walletCoins.find((c) => String(c.id) === coinId);
        const amountNum = parseFloat(coinAmount);
        if (!selectedCoin || !walletCoin || isNaN(amountNum) || amountNum <= 0 || amountNum > walletCoin.amount) {
            alert(t('invalid_amount'));
            return;
        }
        setCart(prev => [...prev, {
            id: String(selectedCoin.id),
            name: selectedCoin.name,
            symbol: selectedCoin.symbol,
            amount: amountNum,
            price: selectedCoin.quote.USD.price,
        }]);
        setCoinId('');
        setCoinAmount('');
        setTotalUSD(0);
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleSellAll = async () => {
        if (!uid || cart.length === 0) return;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        const updatedWallet = { ...(userData?.wallet || {}) };
        let totalEarned = 0;

        cart.forEach(item => {
            if (!updatedWallet[item.id] || updatedWallet[item.id].amount < item.amount) return;
            updatedWallet[item.id].amount -= item.amount;
            totalEarned += item.amount * item.price;
            if (updatedWallet[item.id].amount <= 0) delete updatedWallet[item.id];
        });

        const updatedBalance = (userData?.balance || 0) + totalEarned;
        await updateDoc(docRef, {
            wallet: updatedWallet,
            balance: updatedBalance,
        });

        setSuccessMessage(`${t('sold_successfully')} $${totalEarned.toFixed(2)}`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setCart([]);
        setBalance(updatedBalance);
        setWalletCoins(prev => prev.map(c => {
            const updated = cart.find(i => i.id === String(c.id));
            return updated ? { ...c, amount: c.amount - updated.amount } : c;
        }).filter(c => c.amount > 0));
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
                        <div className="rounded-4 px-4 py-3 bg-light">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3">{t('Overview')}</li>
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
                            <h4 className="mb-4">{t('sell_crypto')}</h4>
                            <div className="alert alert-info">
                                💰 <strong>{t('your_balance')}:</strong> ${balance.toFixed(2)}
                            </div>
                            {successMessage && <div className="alert alert-success">✅ {successMessage}</div>}

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label>{t('select_coin')}</label>
                                    <select className="form-select" value={coinId} onChange={(e) => setCoinId(e.target.value)}>
                                        <option value="">{t('choose')}</option>
                                        {walletCoins.map((coin) => (
                                            <option key={coin.id} value={String(coin.id)}>
                                                {coin.name} ({coin.symbol.toUpperCase()}) - {parseFloat(coin.amount.toFixed(4))} {t('available')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label>{t('amount')}</label>
                                    <input className="form-control" type="number" step="0.0001" placeholder="0.00" value={coinAmount} onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (isNaN(value) || value < 0) {
                                            setCoinAmount('0');
                                        } else {
                                            setCoinAmount(e.target.value);
                                        }
                                    }} />
                                </div>
                            </div>

                            {totalUSD > 0 && (
                                <div className="mt-3 text-success">
                                    <p><strong>{t('you_will_earn')}:</strong> ${totalUSD.toFixed(2)}</p>
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button className="btn btn-outline-primary rounded-5" onClick={addToCart}>{t('add_to_cart')}</button>
                                <button className="btn btn-primary rounded-5 text-white" onClick={handleSellAll} disabled={cart.length === 0}>{t('sell_now')}</button>
                            </div>

                            {cart.length > 0 && (
                                <div className="mt-5">
                                    <h5>{t('cart')}</h5>
                                    <ul className="list-group">
                                        {cart.map((item, idx) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>{item.amount.toFixed(4)} {item.symbol} = ${(item.amount * item.price).toFixed(2)} USD</span>
                                                <button onClick={() => removeFromCart(idx)} className="btn btn-sm btn-outline-danger">✖</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {walletCoins.length > 0 && (
                                <div className="mt-5">
                                    <h5>{t('sellable_coins')}</h5>
                                    <ul className="list-group">
                                        {walletCoins.map((coin) => (
                                            <li key={coin.id} className="list-group-item d-flex justify-content-between">
                                                <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
                                                <span>{parseFloat(coin.amount.toFixed(4))} × ${coin.quote.USD.price.toFixed(2)} = ${(coin.amount * coin.quote.USD.price).toFixed(2)} USD</span>
                                            </li>
                                        ))}
                                    </ul>
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
