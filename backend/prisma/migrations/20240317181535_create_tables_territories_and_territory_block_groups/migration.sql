-- CreateTable
CREATE TABLE "et_prod"."territories" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "area" DECIMAL(60,30) NOT NULL,
    "wkb_geometry" public.geometry(geometry, 4326) NOT NULL,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."territory_block_groups" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "territory_id" INTEGER NOT NULL,
    "block_group_id" VARCHAR(20) NOT NULL,
    "intersect_pct" DECIMAL(31,30) NOT NULL,
    "intersection_area" DECIMAL(60,30),
    "intersection_geometry" public.geometry(geometry, 4326),

    CONSTRAINT "territory_block_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "territory_block_groups_territory_id_block_group_id_key" ON "et_prod"."territory_block_groups"("territory_id", "block_group_id");

-- AddForeignKey
ALTER TABLE "et_prod"."territory_block_groups" ADD CONSTRAINT "territory_block_groups_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "et_prod"."territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
