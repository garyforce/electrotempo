-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "utility_rate_id" INTEGER;

-- AlterTable
ALTER TABLE "et_prod"."utility_rates" ADD COLUMN     "name" VARCHAR(100);

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenarios" ADD CONSTRAINT "terminal_scenarios_utility_rate_id_fkey" FOREIGN KEY ("utility_rate_id") REFERENCES "et_prod"."utility_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
