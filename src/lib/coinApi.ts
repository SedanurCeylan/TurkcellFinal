const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export const fetchCoins = async (limit = 4) => {
    const res = await fetch(`${BASE_URL}?start=1&limit=${limit}&convert=USD`, {
        headers: {
            'X-CMC_PRO_API_KEY': API_KEY!,
        },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Coin verileri alınamadı');
    }

    const data = await res.json();
    return data.data;
};
