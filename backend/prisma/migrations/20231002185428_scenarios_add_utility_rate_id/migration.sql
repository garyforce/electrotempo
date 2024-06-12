-- AlterTable
ALTER TABLE "et_hub"."scenarios" ADD COLUMN "utility_rate_id" INTEGER;

-- AddForeignKey
ALTER TABLE "et_hub"."scenarios" ADD CONSTRAINT "scenarios_utility_rate_id_fkey" FOREIGN KEY ("utility_rate_id") REFERENCES "et_hub"."utility_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
