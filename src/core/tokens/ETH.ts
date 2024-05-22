import { ethers } from "ethers";
import Token from "./Token";

export default class extends Token {
    name = "ETH";

    async getBalance(): Promise<number> {
        const url = new URL("https://api.etherscan.io/api");

        url.searchParams.append("module", "account");
        url.searchParams.append("action", "balance");
        url.searchParams.append("address", this.address);
        url.searchParams.append("tag", "latest");
        url.searchParams.append("apikey", process.env.ETHERSCAN_TOKEN!);

        const result = await fetch(url.href);
        const { result: balance }: { result: string } = await result.json();

        return Number(ethers.formatEther(balance));
    }

    async getBalanceInMYR(): Promise<number> {
        const url = new URL(
            "/api/v3/simple/price",
            "https://api.coingecko.com"
        );

        url.searchParams.append("ids", "ethereum");
        url.searchParams.append("vs_currencies", "myr,usd");
        url.searchParams.append("precision", "full");

        const result = await fetch(url.href);
        const { ethereum } = await result.json();
        const myrPrice = ethereum.myr as number;
        const balance = await this.getBalance();

        return balance * myrPrice;
    }
}
