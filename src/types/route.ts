export type Coin = {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    quote: {
        USD: {
            price: number;
            volume_24h: number;
            percent_change_24h: number;
            market_cap: number;
        };
    };
};
