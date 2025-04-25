'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import PageContainer from '@/components/PageContainer';
import EarnUp from '@/components/molecules/EarnUp';
import withAuth from '@/utils/withAuth';
import BuyHeader from '@/components/molecules/BuyHeader';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { fetchCoins } from '@/lib/coinApi';
import { Coin } from '../../../types/route';
import Navbar from '../../../components/Navbar';

const Buy = () => {
    const t = useTranslations();
    const [coinList, setCoinList] = useState<Coin[]>([]);
    const [coinId, setCoinId] = useState('');
    const [coinAmount, setCoinAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [uid, setUid] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserAndCoins = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            setUid(currentUser.uid);
            const docRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) setBalance(snap.data().balance || 0);
            const coins = await fetchCoins(20);
            setCoinList(coins);
        };
        fetchUserAndCoins();
    }, []);

    useEffect(() => {
        const selectedCoin = coinList.find(c => String(c.id) === coinId);
        const amountNum = parseFloat(coinAmount);
        if (selectedCoin && !isNaN(amountNum) && amountNum > 0) {
            setTotalPrice(amountNum * selectedCoin.quote.USD.price);
        } else {
            setTotalPrice(0);
        }
    }, [coinId, coinAmount, coinList]);

    const handleBuy = async () => {
        if (!coinId || !coinAmount) return alert(t('fill_all_fields'));
        const selectedCoin = coinList.find(c => String(c.id) === coinId);
        if (!selectedCoin) return alert('Coin bulunamadı');
        const amountNum = parseFloat(coinAmount);
        if (isNaN(amountNum) || amountNum <= 0) return alert(t('invalid_amount'));

        const totalCost = amountNum * selectedCoin.quote.USD.price;
        if (totalCost > balance) return alert(t('insufficient_balance'));

        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        const userData = snap.data();
        const wallet = userData?.wallet || {};

        if (wallet[selectedCoin.id]) {
            wallet[selectedCoin.id].amount += amountNum;
        } else {
            wallet[selectedCoin.id] = {
                amount: amountNum,
                priceAtPurchase: selectedCoin.quote.USD.price
            };
        }

        await updateDoc(userRef, {
            balance: Number((balance - totalCost).toFixed(2)),
            wallet
        });

        setBalance(prev => prev - totalCost);
        setSuccessMessage(t('purchase_success'));
        setCoinId('');
        setCoinAmount('');
        setTotalPrice(0);

        setTimeout(() => setSuccessMessage(''), 4000);
    };

    return (
        <section>
            <Navbar />
            <PageContainer bgColor="bg-surface">
                <BuyHeader />
            </PageContainer>

            <div className="container mb-7">
                <div className="row">
                    <div className="col-md-3">
                        <div className="rounded-4 px-4 py-3 bg-light">
                            <ul className="list-group list-group-flush gap-2">
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/wallet" className="text-black text-decoration-none d-block">{t('Overview')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3 bg-primary rounded-5 text-white">
                                    <Link href="/buy" className="text-white text-decoration-none d-block">{t('buy_page_title')}</Link>
                                </li>
                                <li className="list-group-item border-0 ps-3">
                                    <Link href="/sell" className="text-black text-decoration-none d-block">{t('sell_page_title')}</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-9 border-start ps-4">
                        <div className="rounded-4 p-4 shadow-sm bg-surface">
                            <h4 className="mb-4">{t('buy_crypto')}</h4>

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
                                        {coinList.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.symbol.toUpperCase()}) - ${c.quote.USD.price.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label>{t('amount_coin')}</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={coinAmount}
                                        onChange={(e) => setCoinAmount(e.target.value)}

                                    />
                                </div>
                            </div>

                            {totalPrice > 0 && (
                                <div className="mt-3 text-success">
                                    <p><strong>{t('total_payment')}:</strong> ${totalPrice.toFixed(2)}</p>
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    className="btn btn-primary rounded-5 text-white"
                                    onClick={handleBuy}
                                    disabled={!coinId || !coinAmount}
                                >
                                    {t('buy_now')}
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

export default withAuth(Buy);
