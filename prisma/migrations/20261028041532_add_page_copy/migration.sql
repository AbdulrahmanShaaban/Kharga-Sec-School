-- CreateTable
CREATE TABLE "PageCopy" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "PageCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageCopy_page_idx" ON "PageCopy"("page");

-- CreateIndex
CREATE UNIQUE INDEX "PageCopy_page_key_key" ON "PageCopy"("page", "key");
