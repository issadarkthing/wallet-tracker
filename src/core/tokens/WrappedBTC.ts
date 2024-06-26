import { ethers } from "ethers";
import Token from "./Token";
import { exchanger } from "../Exchanger";

export default class extends Token {
    name = "BTC";
    contractAddress = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";

    async getBalance(): Promise<number> {
        const url = new URL("https://api.polygonscan.com/api");

        url.searchParams.append("module", "account");
        url.searchParams.append("action", "tokenbalance");
        url.searchParams.append("contractaddress", this.contractAddress);
        url.searchParams.append("address", this.address);
        url.searchParams.append("tag", "latest");
        url.searchParams.append("apikey", process.env.POLYGONSCAN_TOKEN!);

        const result = await fetch(url.href);
        const { result: balance }: { result: string } = await result.json();

        return Number(ethers.formatUnits(balance, 8));
    }

    async getBalanceInMYR(): Promise<number> {
        const price = await exchanger.get(this.name);
        const balance = await this.getBalance();
        return balance * price;
    }
}
