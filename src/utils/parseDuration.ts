// convert "1h", "3m", "4d" to milliseconds
export function parseDuration(interval: string) {
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
