"use client";

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

const Sell = () => {
    const t = useTranslations();
    const [coinList, setCoinList] = useState<any[]>([]);
    const [walletCoins, setWalletCoins] = useState<any[]>([]);
    const [coinId, setCoinId] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [uid, setUid] = useState('');
    const [calculatedUSD, setCalculatedUSD] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserAndWallet = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            setUid(currentUser.uid);
            const docRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(docRef);

            const userData = snap.data();
            setBalance(userData?.balance || 0);

            const wallet = userData?.wallet || {};
            const coins = await fetchCoins(50);
            setCoinList(coins);

            const owned = coins.filter(c => String(c.id) in wallet && wallet[String(c.id)]?.amount > 0);
            setWalletCoins(owned);
        };

        fetchUserAndWallet();
    }, []);

    useEffect(() => {
        const selectedCoin = walletCoins.find(c => String(c.id) === coinId);
        const amountNum = parseFloat(amount);

        if (selectedCoin && !isNaN(amountNum) && amountNum > 0) {
            const usdValue = amountNum * selectedCoin.quote.USD.price;
            setCalculatedUSD(Number(usdValue.toFixed(2)));
        } else {
            setCalculatedUSD(0);
        }
    }, [coinId, amount, walletCoins]);

    const handleSell = async () => {
        const amountNum = parseFloat(amount);
        if (!coinId || isNaN(amountNum) || amountNum <= 0) return alert(t('invalid_amount'));

        const selectedCoin = walletCoins.find(c => String(c.id) === coinId);
        if (!selectedCoin) return alert(t('coin_not_found'));

        const price = selectedCoin.quote.USD.price;
        const usdValue = amountNum * price;

        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        const userData = snap.data();
        const wallet = userData?.wallet || {};

        if (!wallet[coinId] || wallet[coinId].amount < amountNum) {
            return alert(t('insufficient_coin'));
        }

        wallet[coinId].amount -= amountNum;
        if (wallet[coinId].amount <= 0) delete wallet[coinId];

        await updateDoc(userRef, {
            balance: Number((balance + usdValue).toFixed(2)),
            wallet,
        });

        setBalance(prev => prev + usdValue);
        setSuccessMessage(`${amountNum} ${selectedCoin.symbol} ${t('sold_successfully')} ($${usdValue.toFixed(2)})`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setAmount('');
        setCoinId('');
        setCalculatedUSD(0);

        const updated = coinList.filter(c => String(c.id) in wallet && wallet[String(c.id)]?.amount > 0);
        setWalletCoins(updated);
    };

    const selectedWalletAmount = walletCoins.find(c => String(c.id) === coinId)?.amount;

    return (
        <section>
            <PageContainer bgColor="bg-surface">
                <SellHeader />
            </PageContainer>

            <div className="container my-5">
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
                        <div className="rounded-4 p-4 shadow-sm bg-white">
                            <h4 className="mb-4">{t('sell_crypto')}</h4>

                            <div className="alert alert-info">
                                💰 <strong>{t('your_balance')}:</strong> ${balance.toFixed(2)}
                            </div>

                            {successMessage && (
                                <div className="alert alert-success">✅ {successMessage}</div>
                            )}

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label>{t('select_coin')}</label>
                                    <select className="form-select" value={coinId} onChange={(e) => setCoinId(e.target.value)}>
                                        <option value="">{t('choose')}</option>
                                        {walletCoins.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.symbol.toUpperCase()}) - {c.quote.USD.price.toFixed(2)} USD
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label>{t('amount')}</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        max={selectedWalletAmount || ''}
                                    />
                                    {selectedWalletAmount !== undefined && (
                                        <small className="text-muted">
                                            {t('your_amount')}: {selectedWalletAmount.toFixed(6)} {walletCoins.find(c => String(c.id) === coinId)?.symbol}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {calculatedUSD > 0 && (
                                <div className="mt-3 text-success">
                                    <p><strong>{t('you_will_receive')}:</strong> ${calculatedUSD}</p>
                                </div>
                            )}

                            <div className="d-flex justify-content-end mt-4">
                                <button className="btn btn-primary text-white rounded-5" onClick={handleSell}>
                                    {t('sell_now')}
                                </button>
                            </div>
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