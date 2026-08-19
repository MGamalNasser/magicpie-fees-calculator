CREATE TABLE `gig_itinerary` (
	`id` text PRIMARY KEY NOT NULL,
	`gig_id` text NOT NULL,
	`time` text DEFAULT '' NOT NULL,
	`label` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`gig_id`) REFERENCES `gigs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `gig_itinerary_gig_idx` ON `gig_itinerary` (`gig_id`);--> statement-breakpoint
ALTER TABLE `gigs` ADD `show_time` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `gigs` ADD `itinerary_type` text DEFAULT '' NOT NULL;