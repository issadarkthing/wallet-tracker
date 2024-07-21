import { PrismaClient } from "@prisma/client";

export default class Withdraw {
    prisma = new PrismaClient();

    async getWithdrawals() {
        const result = await this.prisma.withdraw.groupBy({
            by: ["tokenName"],
            _sum: { amount: true },
        });

        return result;
    }

    async getTotalWithdrawals() {
        const result = await this.prisma.withdraw.aggregate({
            _sum: { amount: true },
        });
        return result._sum.amount?.toNumber() || 0;
    }
}
