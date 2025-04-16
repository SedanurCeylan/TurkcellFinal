
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export async function GET() {
    try {
        const res = await fetch(`${BASE_URL}?start=1&limit=8&convert=USD`, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY!,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'API hatası' }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json(data.data);
    } catch (err) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
