CREATE TABLE `itinerary_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`gig_id` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`template_type` text DEFAULT 'local' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gig_id`) REFERENCES `gigs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `itinerary_templates_gig_idx` ON `itinerary_templates` (`gig_id`);--> statement-breakpoint
CREATE INDEX `itinerary_templates_user_idx` ON `itinerary_templates` (`user_id`);--> statement-breakpoint
CREATE TABLE `itinerary_template_items` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`time` text DEFAULT '' NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `itinerary_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `itinerary_template_items_tpl_idx` ON `itinerary_template_items` (`template_id`);--> statement-breakpoint
DROP TABLE `gig_itinerary`;--> statement-breakpoint
ALTER TABLE `gigs` DROP COLUMN `itinerary_type`;