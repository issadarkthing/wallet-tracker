import { ethers } from "ethers";
import Token from "./Token";
import { exchanger } from "../Exchanger";

export default class extends Token {
    name = "TONCOIN";
    contractAddress = "0x76A797A59Ba2C17726896976B7B3747BfD1d220f";

    async getBalance(): Promise<number> {
        const url = new URL("https://api.bscscan.com/api");

        url.searchParams.append("module", "account");
        url.searchParams.append("action", "tokenbalance");
        url.searchParams.append("contractaddress", this.contractAddress);
        url.searchParams.append("address", this.address);
        url.searchParams.append("tag", "latest");
        url.searchParams.append("apikey", process.env.BSCSCAN_TOKEN!);

        const result = await fetch(url.href);
        const { result: balance }: { result: string } = await result.json();

        return Number(ethers.formatUnits(balance, 9));
    }

    async getBalanceInMYR(): Promise<number> {
        const price = await exchanger.get(this.name);
        const balance = await this.getBalance();
        return balance * price;
    }
}
