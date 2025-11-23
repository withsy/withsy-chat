-- CreateTable
CREATE TABLE "supabase_activities" (
    "id" SERIAL NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supabase_activities_pkey" PRIMARY KEY ("id")
);
