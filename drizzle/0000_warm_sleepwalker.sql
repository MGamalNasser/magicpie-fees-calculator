CREATE TABLE `crew` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`role_type` text DEFAULT 'standard' NOT NULL,
	`default_fee` integer DEFAULT 650000 NOT NULL,
	`min_fee` integer DEFAULT 600000 NOT NULL,
	`max_fee` integer DEFAULT 800000 NOT NULL,
	`meal_eligible` integer DEFAULT true NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `crew_user_idx` ON `crew` (`user_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`gig_id` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`gig_id`) REFERENCES `gigs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `expenses_gig_idx` ON `expenses` (`gig_id`);--> statement-breakpoint
CREATE TABLE `gig_crew` (
	`id` text PRIMARY KEY NOT NULL,
	`gig_id` text NOT NULL,
	`crew_id` text NOT NULL,
	`role` text NOT NULL,
	`role_type` text NOT NULL,
	`fee` integer DEFAULT 0 NOT NULL,
	`override_rate` integer DEFAULT false NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_date` text,
	`payment_method` text,
	FOREIGN KEY (`gig_id`) REFERENCES `gigs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `gig_crew_gig_idx` ON `gig_crew` (`gig_id`);--> statement-breakpoint
CREATE TABLE `gig_members` (
	`id` text PRIMARY KEY NOT NULL,
	`gig_id` text NOT NULL,
	`member_id` text NOT NULL,
	`split_pct` integer DEFAULT 0 NOT NULL,
	`payout` integer DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_date` text,
	`payment_method` text,
	FOREIGN KEY (`gig_id`) REFERENCES `gigs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `gig_members_gig_idx` ON `gig_members` (`gig_id`);--> statement-breakpoint
CREATE TABLE `gigs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_name` text NOT NULL,
	`client` text DEFAULT '' NOT NULL,
	`venue` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`event_date` text NOT NULL,
	`gig_type` text DEFAULT 'Other' NOT NULL,
	`total_fee` integer DEFAULT 0 NOT NULL,
	`soundcheck_time` text DEFAULT '' NOT NULL,
	`meal_override` integer,
	`split_mode` text DEFAULT 'equal' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `gigs_user_date_idx` ON `gigs` (`user_id`,`event_date`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'Member' NOT NULL,
	`default_split` integer DEFAULT 20 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`account` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `members_user_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`crew_min_fee` integer DEFAULT 600000 NOT NULL,
	`crew_max_fee` integer DEFAULT 800000 NOT NULL,
	`meal_rate` integer DEFAULT 100000 NOT NULL,
	`meal_cutoff` text DEFAULT '12:00' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_user_uidx` ON `settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);