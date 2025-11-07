-- CreateEnum
CREATE TYPE "mentor_permission" AS ENUM ('READ_ONLY', 'FULL_ACCESS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mentor_permission" "mentor_permission";
