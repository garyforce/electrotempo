-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "charger_id" INTEGER;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenarios" ADD CONSTRAINT "terminal_scenarios_charger_id_fkey" FOREIGN KEY ("charger_id") REFERENCES "et_prod"."chargers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
