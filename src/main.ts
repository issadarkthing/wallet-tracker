import { ethers } from "ethers";
import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const bot = new TelegramBot(telegramBotToken, { polling: true });
const prisma = new PrismaClient();

// gwei
async function getGasPrice() {
    const { gasPrice, maxPriorityFeePerGas } = await provider.getFeeData();

    if (!gasPrice || !maxPriorityFeePerGas)
        return { gasPrice: 0n, txPrice: 0n };

    const maxFeePerGas = 2n * gasPrice + maxPriorityFeePerGas;
    const gasLimit = 21000n;
    const txPrice = maxFeePerGas * gasLimit;

    return { gasPrice, txPrice };
}

async function getBalance(address: string) {
    const url = new URL("https://api.etherscan.io/api");

    url.searchParams.append("module", "account");
    url.searchParams.append("action", "balance");
    url.searchParams.append("address", address);
    url.searchParams.append("tag", "latest");
    url.searchParams.append("apikey", process.env.ETHERSCAN_TOKEN!);

    const result = await fetch(url.href);
    const { result: balance }: { result: string } = await result.json();

    return ethers.parseUnits(balance, "wei");
}

async function getCurrentPrice() {
    const url = new URL("/api/v3/simple/price", "https://api.coingecko.com");

    url.searchParams.append("ids", "ethereum");
    url.searchParams.append("vs_currencies", "myr,usd");
    url.searchParams.append("precision", "full");

    const result = await fetch(url.href);
    const {
        ethereum: { myr, usd },
    } = await result.json();

    return { myr, usd } as { myr: number; usd: number };
}

function convert(balance: bigint, price: number) {
    return Number(ethers.formatEther(balance)) * price;
}

function formatNumber(num: number) {
    return num.toFixed(2);
}

async function getTotalDeposit() {
    const result = await prisma.deposit.aggregate({ _sum: { myr: true } });
    return result._sum.myr?.toNumber() || 0;
}

async function getData() {
    const address = process.env.ADDRESS!;
    const balance = await getBalance(address);
    const { usd, myr } = await getCurrentPrice();
    const date = new Date();
    const displayDate = date.toLocaleDateString("en-GB");
    const displayTime = date.toLocaleTimeString("en-US");
    const displayBalance = Number(ethers.formatEther(balance)).toFixed(5);
    const myrBalance = convert(balance, myr);
    const totalDeposit = await getTotalDeposit();
    const profit = myrBalance - totalDeposit;
    const profitPercent = formatNumber((profit / totalDeposit) * 100);
    const { gasPrice, txPrice } = await getGasPrice();
    const myrTxPrice = convert(txPrice, myr);

    let result = `
<code>${displayBalance} ETH</code>
<b>Balance:</b> <code>${formatNumber(myrBalance)} MYR</code>
<b>Deposit:</b> <code>${formatNumber(totalDeposit)} MYR</code>
<b>Profit:</b> <code>${formatNumber(profit)} MYR (${profitPercent}%)</code>

<b>Gas Price:</b> <code>${formatGwei(gasPrice)} GWEI</code>
<b>Tx Price:</b> <code>${formatGwei(txPrice)} GWEI</code>
<b>Tx Price:</b> <code>${formatNumber(myrTxPrice)} MYR</code>

<b>ETH Price:</b> <code>${formatNumber(usd)} USD</code>
<b>ETH Price:</b> <code>${formatNumber(myr)} MYR</code>
<b>Address:</b> ${address.slice(0, 18)}

<i>${displayDate} ${displayTime}</i>
`;

    return result.trim();
}

function formatGwei(value: bigint) {
    return Math.round(Number(ethers.formatUnits(value, "gwei")));
}

// convert "1h", "3m", "4d" to milliseconds
function parseDuration(interval: string) {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const supportedDurations = ["s", "m", "h", "d", "w"];
    const amount = Number(interval.match(/^\d+/)?.at(0));
    const duration = interval.match(/\w$/)?.at(0);

    if (!amount || !duration) {
        throw new Error("invalid duration");
    }

    if (!supportedDurations.includes(duration)) {
        throw new Error("invalid duration");
    }

    switch (duration) {
        case "s":
            return second * amount;
        case "m":
            return minute * amount;
        case "h":
            return hour * amount;
        case "d":
            return day * amount;
        case "w":
            return week * amount;
        default:
            return 12 * hour;
    }
}

bot.onText(/\/status/, async () => {
    console.log("STATUS command executed");
    const data = await getData();
    const chatId = process.env.CHAT_ID!;

    bot.sendMessage(chatId, data, { parse_mode: "HTML" });
});

bot.onText(/\/info/, async () => {
    console.log("INFO command executed");
    const chatId = process.env.CHAT_ID!;
    const data = "Sends crypto portfolio info";

    bot.sendMessage(chatId, data, { parse_mode: "HTML" });
});

bot.onText(/\/start/, () => {
    console.log("START command executed");
    const chatId = process.env.CHAT_ID!;

    bot.sendMessage(chatId, "Starting bot", {
        reply_markup: {
            keyboard: [
                [{ text: "/status" }],
                [{ text: "/start" }],
                [{ text: "/info" }],
            ],
        },
    });
});

setInterval(async () => {
    console.log("crypto portfolio update");
    const data = await getData();
    const chatId = process.env.CHAT_ID!;

    bot.sendMessage(chatId, data, { parse_mode: "HTML" });
}, parseDuration(process.env.DURATION!));

console.log("bot started");
