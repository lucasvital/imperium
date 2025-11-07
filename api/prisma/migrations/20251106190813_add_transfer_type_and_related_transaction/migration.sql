-- AlterEnum
ALTER TYPE "transaction_type" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "related_transaction_id" UUID;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_related_transaction_id_fkey" FOREIGN KEY ("related_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
