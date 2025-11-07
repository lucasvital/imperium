-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mentor_id" UUID,
ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
