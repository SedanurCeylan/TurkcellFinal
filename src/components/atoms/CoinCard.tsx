'use client';

import Image from 'next/image';
import React, { use, useEffect, useState } from 'react';

interface CoinCardProps {
    name: string;
    symbol: string;
    price: number;
    percentChange: number;
    id: string;

}


const CoinCard = ({ name, symbol, price, percentChange, id }: CoinCardProps) => {
    const isPositive = percentChange >= 0;

    const [price2, setPrice2] = useState<string>('');

    useEffect(() => {
        const number = price.toLocaleString();
        setPrice2(number);
    }
        , []);

    return (
        <div className="card shadow-sm rounded-4 p-4 text-start w-100 h-100">
            <div className="d-flex align-items-center gap-2 mb-2">
                <Image src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`} alt={name} width={24} height={24} />
                <strong>{name}</strong>
                <span className="text-secondary">{symbol}/USD</span>
            </div>
            <h4 className="fw-bold mb-2">USD {price2}</h4>
            <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small">36,641.20</span>
                <span className={`badge ${isPositive ? 'bg-success' : 'bg-danger'}`}>
                    {percentChange.toFixed(2)}%
                </span>
            </div>
        </div>
    );
};

export default CoinCard;
