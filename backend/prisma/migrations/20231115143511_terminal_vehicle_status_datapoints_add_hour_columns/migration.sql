/*
  Warnings:

  - You are about to drop the column `hour` on the `terminal_vehicle_status_datapoints` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `terminal_vehicle_status_datapoints` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" DROP CONSTRAINT "terminal_vehicle_status_datapoints_status_id_fkey";

-- AlterTable
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" DROP COLUMN "hour",
DROP COLUMN "status_id",
ADD COLUMN     "hour_0" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_1" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_2" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_3" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_4" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_5" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_6" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_7" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_8" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_9" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_10" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_11" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_12" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_13" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_14" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_15" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_16" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_17" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_18" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_19" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_20" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_21" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_22" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hour_23" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_0_fkey" FOREIGN KEY ("hour_0") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_1_fkey" FOREIGN KEY ("hour_1") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_2_fkey" FOREIGN KEY ("hour_2") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_3_fkey" FOREIGN KEY ("hour_3") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_4_fkey" FOREIGN KEY ("hour_4") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_5_fkey" FOREIGN KEY ("hour_5") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_6_fkey" FOREIGN KEY ("hour_6") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_7_fkey" FOREIGN KEY ("hour_7") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_8_fkey" FOREIGN KEY ("hour_8") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_9_fkey" FOREIGN KEY ("hour_9") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_10_fkey" FOREIGN KEY ("hour_10") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_11_fkey" FOREIGN KEY ("hour_11") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_12_fkey" FOREIGN KEY ("hour_12") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_13_fkey" FOREIGN KEY ("hour_13") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_14_fkey" FOREIGN KEY ("hour_14") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_15_fkey" FOREIGN KEY ("hour_15") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_16_fkey" FOREIGN KEY ("hour_16") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_17_fkey" FOREIGN KEY ("hour_17") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_18_fkey" FOREIGN KEY ("hour_18") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_19_fkey" FOREIGN KEY ("hour_19") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_20_fkey" FOREIGN KEY ("hour_20") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_21_fkey" FOREIGN KEY ("hour_21") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_22_fkey" FOREIGN KEY ("hour_22") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_hour_23_fkey" FOREIGN KEY ("hour_23") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
