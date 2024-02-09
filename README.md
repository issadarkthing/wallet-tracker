# Wallet Tracker

Telegram bot to track ethereum address balance. Currently supported coin is `eth`
and fiat currency used are `USD` and `MYR`. Planning on adding more
configuration and functionality in the future.

## Installing

1. Install docker
2. Create `.env` file with these values
```
ETHERSCAN_TOKEN=your_etherscan_token
ADDRESS=your_eth_wallet_address
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
DURATION=1d
```
3. Run `docker compose up -d`
4. To stop, run `docker compose down`
