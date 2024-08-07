import TelegramBot from "node-telegram-bot-api";
import { parseDuration } from "../utils/parseDuration";
import ETH from "./tokens/ETH";
import wBTC from "./tokens/WrappedBTC";
import Deposit from "./Deposit";
import { formatNumber } from "../utils/formatNumber";
import BNB from "./tokens/BNB";
import wTON from "./tokens/WrappedTon";
import Withdraw from "./Withdraw";

export default class Telegram {
    telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;
    bot = new TelegramBot(this.telegramBotToken, { polling: true });
    tokens = [new ETH(), new wBTC(), new BNB(), new wTON()];

    async getTokensProfit(
        totalProfit: number,
        profitInPercent: number,
        totalBalance: number
    ) {
        const profit = await Promise.all(
            this.tokens.map((token) =>
                token.getProfit(totalProfit, profitInPercent, totalBalance)
            )
        );

        return profit;
    }

    async getTotalBalance() {
        const balances = await Promise.all(
            this.tokens.map((token) => token.getBalanceInMYR())
        );
        return balances.reduce((acc, val) => acc + val, 0);
    }

    async getData() {
        const address = process.env.ADDRESS!;
        const deposit = new Deposit();
        const withdraw = new Withdraw();
        let totalDeposit =
            (await deposit.getTotalDeposit()) -
            (await withdraw.getTotalWithdrawals());

        if (totalDeposit <= 0) {
            totalDeposit = 1;
        }

        const totalBalance = await this.getTotalBalance();
        const totalProfit = totalBalance - totalDeposit;
        const profitInPercent = (totalProfit / totalDeposit) * 100;
        const date = new Date();
        const displayDate = date.toLocaleDateString("en-GB");
        const displayTime = date.toLocaleTimeString("en-US");
        const profits = await this.getTokensProfit(
            totalProfit,
            profitInPercent,
            totalBalance
        );
        const displayProfit = profits
            .map(
                (profit) =>
                    `${profit.tokenName}: ${formatNumber(profit.profit)} MYR (${formatNumber(profit.profitInPercent)}%)`
            )
            .join("\n");

        let result = `
<b>Deposit:</b> <code>${formatNumber(totalDeposit)} MYR</code>
<b>Balance:</b> <code>${formatNumber(totalBalance)} MYR</code>
<b>Profit:</b> <code>${formatNumber(totalProfit)} MYR (${formatNumber(profitInPercent)}%)</code>

<b>Coins (profit)</b>
${displayProfit}

<b>Address:</b> ${address.slice(0, 18)}

<i>${displayDate} ${displayTime}</i>
`;

        return result;
    }

    run() {
        setInterval(async () => {
            console.log("crypto portfolio update");
            const data = await this.getData();
            const chatId = process.env.CHAT_ID!;

            this.bot.sendMessage(chatId, data, { parse_mode: "HTML" });
        }, parseDuration(process.env.DURATION!));

        console.log("bot started");

        this.bot.onText(/\/status/, async () => {
            console.log("STATUS command executed");
            const data = await this.getData();
            const chatId = process.env.CHAT_ID!;

            this.bot.sendMessage(chatId, data, { parse_mode: "HTML" });
        });

        this.bot.onText(/\/info/, async () => {
            console.log("INFO command executed");
            const chatId = process.env.CHAT_ID!;
            const data = "Sends crypto portfolio info";

            this.bot.sendMessage(chatId, data, { parse_mode: "HTML" });
        });

        this.bot.onText(/\/start/, () => {
            console.log("START command executed");
            const chatId = process.env.CHAT_ID!;

            this.bot.sendMessage(chatId, "Starting bot", {
                reply_markup: {
                    keyboard: [
                        [{ text: "/status" }],
                        [{ text: "/start" }],
                        [{ text: "/info" }],
                    ],
                },
            });
        });
    }
}
