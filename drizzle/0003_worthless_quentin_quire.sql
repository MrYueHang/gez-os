CREATE TABLE `documentDownloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`userId` int NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`documentPath` varchar(512) NOT NULL,
	`documentSize` int,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentDownloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packageType` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`documents` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentPackages_id` PRIMARY KEY(`id`),
	CONSTRAINT `documentPackages_packageType_unique` UNIQUE(`packageType`)
);
--> statement-breakpoint
CREATE TABLE `userPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`packageType` enum('docs_basic','docs_complete','consultation_30','consultation_60','premium_monthly','premium_yearly') NOT NULL,
	`packageName` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'eur',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`downloadCount` int DEFAULT 0,
	`lastDownloadedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `documentDownloads_purchaseId_idx` ON `documentDownloads` (`purchaseId`);--> statement-breakpoint
CREATE INDEX `documentDownloads_userId_idx` ON `documentDownloads` (`userId`);--> statement-breakpoint
CREATE INDEX `userPurchases_userId_idx` ON `userPurchases` (`userId`);--> statement-breakpoint
CREATE INDEX `userPurchases_status_idx` ON `userPurchases` (`status`);--> statement-breakpoint
CREATE INDEX `userPurchases_paymentIntentId_idx` ON `userPurchases` (`stripePaymentIntentId`);