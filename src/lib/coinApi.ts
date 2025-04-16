export const fetchCoins = async (limit = 4) => {
    const res = await fetch(`/api/coins`);

    if (!res.ok) {
        throw new Error('Coin verileri alınamadı');
    }

    const data = await res.json();
    return data.slice(0, limit);
};
