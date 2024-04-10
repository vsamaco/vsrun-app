-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "shoeId" TEXT;

-- CreateTable
CREATE TABLE "Shoe" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "brand_name" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "categories" TEXT[],
    "metadata" JSONB,
    "runProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shoe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShoeToShoeRotation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Shoe_slug_key" ON "Shoe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_ShoeToShoeRotation_AB_unique" ON "_ShoeToShoeRotation"("A", "B");

-- CreateIndex
CREATE INDEX "_ShoeToShoeRotation_B_index" ON "_ShoeToShoeRotation"("B");

-- AddForeignKey
ALTER TABLE "Shoe" ADD CONSTRAINT "Shoe_runProfileId_fkey" FOREIGN KEY ("runProfileId") REFERENCES "RunProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_shoeId_fkey" FOREIGN KEY ("shoeId") REFERENCES "Shoe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShoeToShoeRotation" ADD CONSTRAINT "_ShoeToShoeRotation_A_fkey" FOREIGN KEY ("A") REFERENCES "Shoe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShoeToShoeRotation" ADD CONSTRAINT "_ShoeToShoeRotation_B_fkey" FOREIGN KEY ("B") REFERENCES "ShoeRotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
