/*
  Warnings:

  - You are about to drop the column `engineType` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `vin` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceUrl` on the `MaintenanceLog` table. All the data in the column will be lost.
  - You are about to drop the column `mileageAtService` on the `MaintenanceLog` table. All the data in the column will be lost.
  - You are about to drop the column `nextServiceDate` on the `MaintenanceLog` table. All the data in the column will be lost.
  - You are about to drop the column `serviceDate` on the `MaintenanceLog` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `MaintenanceLog` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `MaintenanceLog` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuelType` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `MaintenanceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mileage` to the `MaintenanceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `MaintenanceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MaintenanceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MaintenanceLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `MaintenanceLog` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "fuelType" TEXT NOT NULL,
    "engineSize" TEXT,
    "color" TEXT,
    "lastMaintenance" TEXT,
    "nextMaintenance" TEXT,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "maintenanceCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("createdAt", "id", "isActive", "licensePlate", "mileage", "model", "userId", "year") SELECT "createdAt", "id", "isActive", "licensePlate", "mileage", "model", "userId", "year" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE UNIQUE INDEX "Car_licensePlate_key" ON "Car"("licensePlate");
CREATE TABLE "new_MaintenanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "mileage" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopAddress" TEXT,
    "parts" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceLog_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MaintenanceLog" ("carId", "cost", "createdAt", "description", "id") SELECT "carId", "cost", "createdAt", "description", "id" FROM "MaintenanceLog";
DROP TABLE "MaintenanceLog";
ALTER TABLE "new_MaintenanceLog" RENAME TO "MaintenanceLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
