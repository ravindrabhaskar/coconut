ALTER TYPE "public"."evidence_type" ADD VALUE 'SOURCE_BACKED' BEFORE 'ESTIMATE';--> statement-breakpoint
CREATE TABLE "government_schemes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"status" "entity_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone,
	"data" jsonb NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "machine_quotations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"status" "entity_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone,
	"data" jsonb NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "price_records" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"status" "entity_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone,
	"data" jsonb NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "search_index" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"type_label" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"href" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"keywords" text DEFAULT '' NOT NULL,
	"group" text DEFAULT '' NOT NULL,
	"tsv" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(name, '')), 'A') || setweight(to_tsvector('english', coalesce("group", '') || ' ' || coalesce(keywords, '')), 'B') || setweight(to_tsvector('english', coalesce(summary, '')), 'C')) STORED,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "government_schemes_slug_idx" ON "government_schemes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "government_schemes_status_idx" ON "government_schemes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "machine_quotations_slug_idx" ON "machine_quotations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "machine_quotations_status_idx" ON "machine_quotations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "price_records_slug_idx" ON "price_records" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "price_records_status_idx" ON "price_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "search_tsv_idx" ON "search_index" USING gin ("tsv");--> statement-breakpoint
CREATE INDEX "search_type_idx" ON "search_index" USING btree ("type");