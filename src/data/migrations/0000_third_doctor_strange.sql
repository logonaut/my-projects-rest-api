CREATE TABLE `birds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`common_name` text NOT NULL,
	`scientific_name` text,
	`family` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bird_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`bird_id`) REFERENCES `birds`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sightings_status_check" CHECK("sightings"."status" IN ('planned', 'in-field', 'logged'))
);
--> statement-breakpoint
CREATE INDEX `idx_sightings_bird_id` ON `sightings` (`bird_id`);