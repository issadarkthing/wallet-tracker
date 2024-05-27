import { ethers } from "ethers";
import Token from "./Token";
import { exchanger } from "../Exchanger";

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
        const price = await exchanger.get(this.name);
        const balance = await this.getBalance();
        return balance * price;
    }
}
