import { PrismaClient } from "@prisma/client";

export default class Deposit {
    prisma = new PrismaClient();

    async getDeposit() {
        const result = await this.prisma.deposit.groupBy({
            by: ["tokenName"],
            _sum: { amount: true },
        });

        return result;
    }

    async getTotalDeposit() {
        const result = await this.prisma.deposit.aggregate({
            _sum: { amount: true },
        });
        return result._sum.amount?.toNumber() || 0;
    }
}
