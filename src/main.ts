import { config } from "dotenv";
config();
import Telegram from "./core/Telegram";

const telegram = new Telegram();

telegram.run();
