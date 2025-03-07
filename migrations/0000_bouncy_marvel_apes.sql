CREATE TABLE "health_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"data" json NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"blood_type" text,
	"medical_history" json DEFAULT '[]'::json NOT NULL,
	"family_history" json DEFAULT '[]'::json NOT NULL,
	"lifestyle" json NOT NULL,
	"emergency_contacts" json DEFAULT '[]'::json NOT NULL,
	"organ_donor" boolean DEFAULT false NOT NULL,
	"data_sharing" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
