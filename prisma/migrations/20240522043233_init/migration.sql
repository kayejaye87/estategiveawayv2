-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "ItemTitle" TEXT NOT NULL,
    "ItemCondition" TEXT NOT NULL,
    "ItemDescription" TEXT NOT NULL,
    "Photo" TEXT NOT NULL,
    "MobileNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);
