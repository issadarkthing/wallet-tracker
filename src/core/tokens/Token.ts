export default abstract class Token {
    abstract name: string;
    abstract getBalance(): Promise<number>;
    abstract getBalanceInMYR(): Promise<number>;
    address = process.env.ADDRESS!;
}
