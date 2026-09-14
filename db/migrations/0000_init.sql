CREATE TYPE "public"."entity_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('VERIFIED_FACT', 'ESTIMATE', 'ASSUMPTION', 'CALCULATED', 'EXPERT_JUDGMENT', 'RESEARCH_REQUIRED');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"table" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"actor" text,
	"at" timestamp DEFAULT now(),
	"diff" jsonb
);
--> statement-breakpoint
CREATE TABLE "certifications" (
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
CREATE TABLE "competitors" (
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
CREATE TABLE "components" (
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
CREATE TABLE "countries" (
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
CREATE TABLE "customer_segments" (
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
CREATE TABLE "customers" (
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
CREATE TABLE "evidence_records" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"field" text NOT NULL,
	"value" real,
	"unit" text NOT NULL,
	"min" real,
	"max" real,
	"currency" text,
	"geography" text,
	"scale" text,
	"basis" text,
	"evidence" "evidence_type" NOT NULL,
	"source_ids" jsonb,
	"published_at" timestamp,
	"researched_at" timestamp,
	"last_verified_at" timestamp,
	"formula" text,
	"notes" text,
	"confidence" text,
	"year" integer
);
--> statement-breakpoint
CREATE TABLE "exports" (
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
CREATE TABLE "factories" (
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
CREATE TABLE "factory_scale_models" (
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
CREATE TABLE "factory_zones" (
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
CREATE TABLE "field_interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"stakeholder" text NOT NULL,
	"participant_type" text,
	"date" timestamp,
	"location" text,
	"completed" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"tags" jsonb,
	"answers" jsonb,
	"source_reference" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "financial_assumptions" (
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
CREATE TABLE "financial_models" (
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
CREATE TABLE "industries" (
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
CREATE TABLE "locations" (
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
CREATE TABLE "machine_product_links" (
	"id" text PRIMARY KEY NOT NULL,
	"machine_id" text NOT NULL,
	"product_id" text NOT NULL,
	"process_stage" text
);
--> statement-breakpoint
CREATE TABLE "machines" (
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
CREATE TABLE "manpower_roles" (
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
CREATE TABLE "markets" (
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
CREATE TABLE "mass_balance_models" (
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
CREATE TABLE "opportunities" (
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
CREATE TABLE "opportunity_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"criterion" text NOT NULL,
	"score" real NOT NULL,
	"weight" real NOT NULL,
	"reason" text,
	"evidence" "evidence_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packaging" (
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
CREATE TABLE "process_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"process_id" text NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processes" (
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
CREATE TABLE "product_categories" (
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
CREATE TABLE "products" (
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
CREATE TABLE "quality_parameters" (
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
CREATE TABLE "raw_materials" (
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
CREATE TABLE "regulations" (
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
CREATE TABLE "relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"from_type" text NOT NULL,
	"from_id" text NOT NULL,
	"relation" text NOT NULL,
	"to_type" text NOT NULL,
	"to_id" text NOT NULL,
	"note" text,
	"evidence" "evidence_type",
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "research_documents" (
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
CREATE TABLE "research_notes" (
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
CREATE TABLE "risks" (
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
CREATE TABLE "roadmap_tasks" (
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
CREATE TABLE "sources" (
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
CREATE TABLE "states" (
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
CREATE TABLE "storage_requirements" (
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
CREATE TABLE "supplier_categories" (
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
CREATE TABLE "technologies" (
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
CREATE TABLE "utilities" (
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
CREATE TABLE "value_chain_nodes" (
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
CREATE TABLE "visual_assets" (
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
ALTER TABLE "machine_product_links" ADD CONSTRAINT "machine_product_links_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_product_links" ADD CONSTRAINT "machine_product_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_scores" ADD CONSTRAINT "opportunity_scores_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_steps" ADD CONSTRAINT "process_steps_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "certifications_slug_idx" ON "certifications" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "certifications_status_idx" ON "certifications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "competitors_slug_idx" ON "competitors" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "competitors_status_idx" ON "competitors" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "components_slug_idx" ON "components" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "components_status_idx" ON "components" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_slug_idx" ON "countries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "countries_status_idx" ON "countries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_segments_slug_idx" ON "customer_segments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "customer_segments_status_idx" ON "customer_segments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_slug_idx" ON "customers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "evidence_entity_idx" ON "evidence_records" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exports_slug_idx" ON "exports" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "exports_status_idx" ON "exports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "factories_slug_idx" ON "factories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "factories_status_idx" ON "factories" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "factory_scale_models_slug_idx" ON "factory_scale_models" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "factory_scale_models_status_idx" ON "factory_scale_models" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "factory_zones_slug_idx" ON "factory_zones" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "factory_zones_status_idx" ON "factory_zones" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "financial_assumptions_slug_idx" ON "financial_assumptions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "financial_assumptions_status_idx" ON "financial_assumptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "financial_models_slug_idx" ON "financial_models" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "financial_models_status_idx" ON "financial_models" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "industries_status_idx" ON "industries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "locations_status_idx" ON "locations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mpl_machine_idx" ON "machine_product_links" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "mpl_product_idx" ON "machine_product_links" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "machines_slug_idx" ON "machines" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "machines_status_idx" ON "machines" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "manpower_roles_slug_idx" ON "manpower_roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "manpower_roles_status_idx" ON "manpower_roles" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "markets_slug_idx" ON "markets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "markets_status_idx" ON "markets" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "mass_balance_models_slug_idx" ON "mass_balance_models" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "mass_balance_models_status_idx" ON "mass_balance_models" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opp_scores_idx" ON "opportunity_scores" USING btree ("opportunity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "packaging_slug_idx" ON "packaging" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "packaging_status_idx" ON "packaging" USING btree ("status");--> statement-breakpoint
CREATE INDEX "process_steps_process_idx" ON "process_steps" USING btree ("process_id");--> statement-breakpoint
CREATE UNIQUE INDEX "processes_slug_idx" ON "processes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "processes_status_idx" ON "processes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_categories_status_idx" ON "product_categories" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "quality_parameters_slug_idx" ON "quality_parameters" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "quality_parameters_status_idx" ON "quality_parameters" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "raw_materials_slug_idx" ON "raw_materials" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "raw_materials_status_idx" ON "raw_materials" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "regulations_slug_idx" ON "regulations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "regulations_status_idx" ON "regulations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rel_from_idx" ON "relationships" USING btree ("from_type","from_id");--> statement-breakpoint
CREATE INDEX "rel_to_idx" ON "relationships" USING btree ("to_type","to_id");--> statement-breakpoint
CREATE INDEX "rel_relation_idx" ON "relationships" USING btree ("relation");--> statement-breakpoint
CREATE UNIQUE INDEX "research_documents_slug_idx" ON "research_documents" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "research_documents_status_idx" ON "research_documents" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "research_notes_slug_idx" ON "research_notes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "research_notes_status_idx" ON "research_notes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "risks_slug_idx" ON "risks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "risks_status_idx" ON "risks" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "roadmap_tasks_slug_idx" ON "roadmap_tasks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_status_idx" ON "roadmap_tasks" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_slug_idx" ON "sources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sources_status_idx" ON "sources" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "states_slug_idx" ON "states" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "states_status_idx" ON "states" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "storage_requirements_slug_idx" ON "storage_requirements" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "storage_requirements_status_idx" ON "storage_requirements" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_categories_slug_idx" ON "supplier_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "supplier_categories_status_idx" ON "supplier_categories" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_slug_idx" ON "technologies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "technologies_status_idx" ON "technologies" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "utilities_slug_idx" ON "utilities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "utilities_status_idx" ON "utilities" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "value_chain_nodes_slug_idx" ON "value_chain_nodes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "value_chain_nodes_status_idx" ON "value_chain_nodes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "visual_assets_slug_idx" ON "visual_assets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "visual_assets_status_idx" ON "visual_assets" USING btree ("status");