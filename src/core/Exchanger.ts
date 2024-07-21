type FetchResult = Record<string, { myr: number }>;

class Exchanger {
    coins = [
        { id: "bitcoin", name: "BTC" },
        { id: "ethereum", name: "ETH" },
        { id: "binancecoin", name: "BNB" },
        { id: "the-open-network", name: "TONCOIN" },
    ];
    cache = new Map<string, number>();
    timestamp = 0;

    async get(name: string) {
        if (this.isExpired()) {
            await this.updatePrices();
        }

        return this.cache.get(name)!;
    }

    private idToName(id: string) {
        return this.coins.find((coin) => coin.id === id)?.name;
    }

    private isExpired() {
        // 5 mins
        return Date.now() - this.timestamp >= 300000;
    }

    private async updatePrices() {
        const ids = this.coins.map((coin) => coin.id);
        const url = new URL(
            "/api/v3/simple/price",
            "https://api.coingecko.com"
        );

        url.searchParams.append("ids", ids.join(","));
        url.searchParams.append("vs_currencies", "myr,usd");
        url.searchParams.append("precision", "full");

        const response = await fetch(url.href, {
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": "CG-yDRJ8VXNUiRQ6X7Eq3s3azak",
            },
        });
        const result = (await response.json()) as FetchResult;

        for (const [id, { myr: price }] of Object.entries(result)) {
            const name = this.idToName(id)!;
            this.cache.set(name, price);
            this.timestamp = Date.now();
        }
    }
}

export const exchanger = new Exchanger();
