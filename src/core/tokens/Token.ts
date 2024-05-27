export default abstract class Token {
    abstract name: string;
    abstract getBalance(): Promise<number>;
    abstract getBalanceInMYR(): Promise<number>;
    address = process.env.ADDRESS!;

    async getProfit(totalProfitInPercent: number, totalBalance: number) {
        const balance = await this.getBalanceInMYR();
        const profit = totalProfitInPercent * (balance / totalBalance);
        return { tokenName: this.name, profit };
    }
}
