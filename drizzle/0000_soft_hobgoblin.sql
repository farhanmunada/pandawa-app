CREATE TYPE "public"."letter_type" AS ENUM('UNDANGAN', 'PERINGATAN', 'GIRIK_IURAN', 'SURAT_TUGAS', 'PERMOHONAN', 'REKOMENDASI', 'SURAT_KEPUTUSAN', 'SURAT_MASUK');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_id" integer NOT NULL,
	"member_number" varchar(50),
	"position_title" varchar(100) NOT NULL,
	"division" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_member_number_unique" UNIQUE("member_number")
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"start_year" integer NOT NULL,
	"end_year" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"division" varchar(50),
	"description" text,
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" varchar(25),
	"avatar_drive_id" text,
	"avatar_drive_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" integer NOT NULL,
	"period_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_dispositions" (
	"id" serial PRIMARY KEY NOT NULL,
	"letter_id" integer NOT NULL,
	"assigned_to_user_id" text NOT NULL,
	"instructions" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letters" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"direction" varchar(10) NOT NULL,
	"letter_type" "letter_type" NOT NULL,
	"letter_number" varchar(100) NOT NULL,
	"sequence_number" integer NOT NULL,
	"year" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"sender" varchar(150) NOT NULL,
	"recipient" varchar(150) NOT NULL,
	"letter_date" date NOT NULL,
	"file_drive_id" text,
	"file_drive_url" text,
	"status" varchar(25) DEFAULT 'APPROVED' NOT NULL,
	"primary_signatory_name" varchar(100),
	"secondary_signatory_name" varchar(100),
	"signed_at" timestamp,
	"is_public" boolean DEFAULT false NOT NULL,
	"requested_by_division" varchar(50),
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "letters_letter_number_unique" UNIQUE("letter_number")
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" integer NOT NULL,
	"type" varchar(10) NOT NULL,
	"category" varchar(50) NOT NULL,
	"amount" bigint NOT NULL,
	"transaction_date" date NOT NULL,
	"description" text NOT NULL,
	"receipt_drive_id" text,
	"receipt_drive_url" text,
	"status" varchar(20) DEFAULT 'APPROVED' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"rejection_reason" text,
	"event_id" integer,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_dues_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_dues_schedule_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"amount_paid" bigint NOT NULL,
	"status" varchar(20) DEFAULT 'LUNAS' NOT NULL,
	"payment_date" date NOT NULL,
	"proof_drive_id" text,
	"notes" text,
	"recorded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_dues_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"target_amount_per_member" bigint NOT NULL,
	"due_date" date NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_dues_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"period_label" varchar(30) NOT NULL,
	"amount" bigint NOT NULL,
	"payment_date" date NOT NULL,
	"proof_drive_id" text,
	"recorded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_dues_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"amount_per_period" bigint NOT NULL,
	"frequency" varchar(20) DEFAULT 'monthly' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"current_balance" bigint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_committees" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"section" varchar(50) NOT NULL,
	"role_title" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"location" varchar(200) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'PLANNING' NOT NULL,
	"planned_budget" bigint DEFAULT 0 NOT NULL,
	"kas_allocation" bigint DEFAULT 0 NOT NULL,
	"external_sponsor_amount" bigint DEFAULT 0 NOT NULL,
	"has_special_dues" boolean DEFAULT false NOT NULL,
	"associated_letter_id" integer,
	"drive_folder_id" text,
	"drive_folder_url" text,
	"pic_user_id" text NOT NULL,
	"lpj_notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"client_tier" varchar(15) NOT NULL,
	"borrower_name" varchar(100) NOT NULL,
	"borrower_phone" varchar(25) NOT NULL,
	"quantity" integer NOT NULL,
	"start_date" date NOT NULL,
	"expected_end_date" date NOT NULL,
	"actual_end_date" date,
	"purpose" text NOT NULL,
	"total_fee" bigint DEFAULT 0 NOT NULL,
	"cash_transaction_id" text,
	"status" varchar(20) DEFAULT 'REQUESTED' NOT NULL,
	"return_condition" varchar(25),
	"return_notes" text,
	"processed_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"category" varchar(50) NOT NULL,
	"total_quantity" integer NOT NULL,
	"available_quantity" integer NOT NULL,
	"condition" varchar(25) DEFAULT 'GOOD' NOT NULL,
	"storage_location" varchar(100) NOT NULL,
	"photo_drive_id" text,
	"is_rentable" boolean DEFAULT false NOT NULL,
	"internal_rate_per_day" bigint DEFAULT 0 NOT NULL,
	"external_rate_per_day" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "incident_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" integer NOT NULL,
	"assigned_user_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" integer NOT NULL,
	"author_user_id" text NOT NULL,
	"action_taken" text NOT NULL,
	"proof_drive_id" text,
	"proof_drive_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(150) NOT NULL,
	"incident_time" timestamp NOT NULL,
	"urgency" varchar(20) NOT NULL,
	"is_confidential" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"reporter_user_id" text,
	"reporter_name" varchar(100) NOT NULL,
	"proof_drive_id" text,
	"proof_drive_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" varchar(50) NOT NULL,
	"target_table" varchar(50) NOT NULL,
	"record_id" text NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_letter_id_letters_id_fk" FOREIGN KEY ("letter_id") REFERENCES "public"."letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_assigned_to_user_id_user_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letters" ADD CONSTRAINT "letters_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letters" ADD CONSTRAINT "letters_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_dues_payments" ADD CONSTRAINT "event_dues_payments_event_dues_schedule_id_event_dues_schedules_id_fk" FOREIGN KEY ("event_dues_schedule_id") REFERENCES "public"."event_dues_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_dues_payments" ADD CONSTRAINT "event_dues_payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_dues_payments" ADD CONSTRAINT "event_dues_payments_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_dues_payments" ADD CONSTRAINT "event_dues_payments_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_dues_payments" ADD CONSTRAINT "routine_dues_payments_schedule_id_routine_dues_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."routine_dues_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_dues_payments" ADD CONSTRAINT "routine_dues_payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_dues_payments" ADD CONSTRAINT "routine_dues_payments_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_dues_payments" ADD CONSTRAINT "routine_dues_payments_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_dues_schedules" ADD CONSTRAINT "routine_dues_schedules_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_committees" ADD CONSTRAINT "event_committees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_committees" ADD CONSTRAINT "event_committees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_associated_letter_id_letters_id_fk" FOREIGN KEY ("associated_letter_id") REFERENCES "public"."letters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_pic_user_id_user_id_fk" FOREIGN KEY ("pic_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_cash_transaction_id_cash_transactions_id_fk" FOREIGN KEY ("cash_transaction_id") REFERENCES "public"."cash_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_processed_by_user_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_assignees" ADD CONSTRAINT "incident_assignees_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_assignees" ADD CONSTRAINT "incident_assignees_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_logs" ADD CONSTRAINT "incident_logs_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_logs" ADD CONSTRAINT "incident_logs_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;