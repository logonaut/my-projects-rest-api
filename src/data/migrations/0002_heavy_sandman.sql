ALTER TABLE `birds` ADD `user_id` integer NOT NULL REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `idx_birds_user_id` ON `birds` (`user_id`);