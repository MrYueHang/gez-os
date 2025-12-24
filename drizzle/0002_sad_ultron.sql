CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeInvoiceId` varchar(255) NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'eur',
	`status` enum('draft','open','paid','void','uncollectible') NOT NULL,
	`paidAt` timestamp,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_stripeInvoiceId_unique` UNIQUE(`stripeInvoiceId`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'eur',
	`status` enum('pending','succeeded','failed','canceled') NOT NULL,
	`description` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentTransactions_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripePromotionCodeId` varchar(255) NOT NULL,
	`stripeCouponId` varchar(255) NOT NULL,
	`code` varchar(100) NOT NULL,
	`description` varchar(255),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_stripePromotionCodeId_unique` UNIQUE(`stripePromotionCodeId`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `stripePrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`stripeProductId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'eur',
	`interval` enum('one_time','month','year') NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripePrices_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripePrices_stripePriceId_unique` UNIQUE(`stripePriceId`)
);
--> statement-breakpoint
CREATE TABLE `stripeProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeProductId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('lawyer_consultation','premium_feature','document_package','subscription','other') NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeProducts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeProducts_stripeProductId_unique` UNIQUE(`stripeProductId`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`status` enum('active','paused','canceled','past_due') NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSubscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `invoices_userId_idx` ON `invoices` (`userId`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `paymentTransactions_userId_idx` ON `paymentTransactions` (`userId`);--> statement-breakpoint
CREATE INDEX `paymentTransactions_status_idx` ON `paymentTransactions` (`status`);--> statement-breakpoint
CREATE INDEX `stripePrices_stripeProductId_idx` ON `stripePrices` (`stripeProductId`);--> statement-breakpoint
CREATE INDEX `userSubscriptions_userId_idx` ON `userSubscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `userSubscriptions_status_idx` ON `userSubscriptions` (`status`);