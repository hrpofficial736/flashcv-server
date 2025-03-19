-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resumes" TEXT[] DEFAULT ARRAY[]::TEXT[];
