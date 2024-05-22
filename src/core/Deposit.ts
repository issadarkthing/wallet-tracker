import { PrismaClient } from "@prisma/client";

export default class Deposit {
    prisma = new PrismaClient();

    async getTotalDeposit() {
        const result = await this.prisma.deposit.aggregate({
            _sum: { myr: true },
        });
        return result._sum.myr?.toNumber() || 0;
    }
}
