-- AlterTable
ALTER TABLE "transactions"
  ADD COLUMN "installment_group_id" UUID,
  ADD COLUMN "installment_number" INTEGER,
  ADD COLUMN "total_installments" INTEGER,
  ADD COLUMN "installment_total_value" DOUBLE PRECISION;



