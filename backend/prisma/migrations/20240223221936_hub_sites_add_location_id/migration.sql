-- AlterTable
ALTER TABLE "et_hub"."sites" ADD COLUMN     "location_id" INTEGER;

-- AddForeignKey
ALTER TABLE "et_hub"."sites" ADD CONSTRAINT "sites_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "et_prod"."location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
