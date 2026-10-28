-- DropForeignKey
ALTER TABLE "ContentMedia" DROP CONSTRAINT "ContentMedia_contentItemId_fkey";

-- AlterTable
ALTER TABLE "ContentMedia" ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "format" TEXT,
ALTER COLUMN "contentItemId" DROP NOT NULL,
ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';

-- CreateIndex
CREATE INDEX "Complaint_status_submittedAt_idx" ON "Complaint"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "ContentItem_type_status_publishedAt_idx" ON "ContentItem"("type", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "ContentItem_status_updatedAt_idx" ON "ContentItem"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentMedia_publicId_key" ON "ContentMedia"("publicId");

-- CreateIndex
CREATE INDEX "ContentMedia_contentItemId_idx" ON "ContentMedia"("contentItemId");

-- CreateIndex
CREATE INDEX "SuggestionPrivate_status_submittedAt_idx" ON "SuggestionPrivate"("status", "submittedAt");

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
