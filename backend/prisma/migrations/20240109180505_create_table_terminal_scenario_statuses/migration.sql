-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "status_id" INTEGER,
ADD COLUMN     "status_updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "et_prod"."terminal_scenario_statuses" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "terminal_scenario_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terminal_scenario_statuses_uuid_key" ON "et_prod"."terminal_scenario_statuses"("uuid");

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenarios" ADD CONSTRAINT "terminal_scenarios_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "et_prod"."terminal_scenario_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
