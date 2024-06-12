/*
  Warnings:

  - You are about to drop the column `buy_american_compliance` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_prod"."vehicles" DROP COLUMN "buy_american_compliance",
ADD COLUMN     "buy_america_compliance" BOOLEAN NOT NULL DEFAULT false;
