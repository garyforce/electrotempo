-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "opt_num_chargers" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "num_chargers" SET DEFAULT 0;
