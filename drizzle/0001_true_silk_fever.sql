CREATE TABLE `arguments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`position` int NOT NULL,
	`politicalSpectrum` int,
	`category` varchar(100),
	`upvotes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arguments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`caseType` enum('Beitragsbescheid','Mahnung','Vollstreckung','Härtefall','Umzug','Befreiung','Treuhand','Schadensersatz','Sonstiges') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('Neu','In Bearbeitung','Widerspruch eingereicht','Anwalt konsultiert','Abgeschlossen','Archiviert') NOT NULL DEFAULT 'Neu',
	`amount` decimal(10,2),
	`currency` varchar(3) DEFAULT 'EUR',
	`receivedDate` timestamp,
	`deadline` timestamp,
	`assignedLawyerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('Erfahrungsbericht','Frage','Tipp','Ressource','Erfolgsgeschichte','Diskussion') NOT NULL,
	`tags` json,
	`sentiment` enum('positiv','neutral','negativ'),
	`upvotes` int DEFAULT 0,
	`downvotes` int DEFAULT 0,
	`commentCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataRoomFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataRoomId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`s3Url` varchar(512),
	`fileType` varchar(100),
	`fileSize` int,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dataRoomFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataRooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`documentType` enum('Beitragsbescheid','Mahnung','Vollstreckungsbescheid','Widerspruch','Auskunftsersuchen','Härtefallantrag','Anwaltsschreiben','Sonstiges') NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`s3Url` varchar(512),
	`mimeType` varchar(100),
	`fileSize` int,
	`extractedData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `externalResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`description` text,
	`resourceType` enum('Community','Informationsseite','Forum','Boykott-Initiative','Rechtliche Ressource') NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lawyerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firmName` varchar(255),
	`location` varchar(255),
	`phone` varchar(20),
	`website` varchar(512),
	`specializations` json,
	`experience` int,
	`rating` decimal(3,2),
	`reviewCount` int DEFAULT 0,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lawyerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `lawyerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `lawyerReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lawyerId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lawyerReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterIssues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`issueNumber` int,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterIssues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`isSubscribed` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pollVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollId` int NOT NULL,
	`userId` int NOT NULL,
	`selectedOption` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pollVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`pollType` enum('Ja/Nein','Multiple Choice','Ranking','Tier-Umfrage') NOT NULL,
	`options` json,
	`isActive` boolean DEFAULT true,
	`totalVotes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wikiArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255),
	`content` text NOT NULL,
	`category` varchar(100),
	`tags` json,
	`isPublished` boolean DEFAULT false,
	`views` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wikiArticles_id` PRIMARY KEY(`id`),
	CONSTRAINT `wikiArticles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wordCloudData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`frequency` int DEFAULT 1,
	`sentiment` enum('positiv','neutral','negativ'),
	`category` varchar(100),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wordCloudData_id` PRIMARY KEY(`id`),
	CONSTRAINT `wordCloudData_word_unique` UNIQUE(`word`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','lawyer','moderator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `isLawyer` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `lawyerSpecializations` json;--> statement-breakpoint
ALTER TABLE `users` ADD `lawyerContact` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isOpinionLeader` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `opinionLeaderBio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `argumentPosition` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `arguments_userId_idx` ON `arguments` (`userId`);--> statement-breakpoint
CREATE INDEX `arguments_position_idx` ON `arguments` (`position`);--> statement-breakpoint
CREATE INDEX `cases_userId_idx` ON `cases` (`userId`);--> statement-breakpoint
CREATE INDEX `cases_caseType_idx` ON `cases` (`caseType`);--> statement-breakpoint
CREATE INDEX `cases_status_idx` ON `cases` (`status`);--> statement-breakpoint
CREATE INDEX `communityPosts_userId_idx` ON `communityPosts` (`userId`);--> statement-breakpoint
CREATE INDEX `communityPosts_category_idx` ON `communityPosts` (`category`);--> statement-breakpoint
CREATE INDEX `dataRoomFiles_dataRoomId_idx` ON `dataRoomFiles` (`dataRoomId`);--> statement-breakpoint
CREATE INDEX `dataRooms_caseId_idx` ON `dataRooms` (`caseId`);--> statement-breakpoint
CREATE INDEX `dataRooms_userId_idx` ON `dataRooms` (`userId`);--> statement-breakpoint
CREATE INDEX `documents_caseId_idx` ON `documents` (`caseId`);--> statement-breakpoint
CREATE INDEX `documents_userId_idx` ON `documents` (`userId`);--> statement-breakpoint
CREATE INDEX `lawyerProfiles_userId_idx` ON `lawyerProfiles` (`userId`);--> statement-breakpoint
CREATE INDEX `lawyerReviews_lawyerId_idx` ON `lawyerReviews` (`lawyerId`);--> statement-breakpoint
CREATE INDEX `lawyerReviews_userId_idx` ON `lawyerReviews` (`userId`);--> statement-breakpoint
CREATE INDEX `newsletterSubscriptions_userId_idx` ON `newsletterSubscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `newsletterSubscriptions_email_idx` ON `newsletterSubscriptions` (`email`);--> statement-breakpoint
CREATE INDEX `pollVotes_pollId_idx` ON `pollVotes` (`pollId`);--> statement-breakpoint
CREATE INDEX `pollVotes_userId_idx` ON `pollVotes` (`userId`);--> statement-breakpoint
CREATE INDEX `polls_createdBy_idx` ON `polls` (`createdBy`);--> statement-breakpoint
CREATE INDEX `wikiArticles_createdBy_idx` ON `wikiArticles` (`createdBy`);--> statement-breakpoint
CREATE INDEX `wikiArticles_slug_idx` ON `wikiArticles` (`slug`);--> statement-breakpoint
CREATE INDEX `wordCloudData_word_idx` ON `wordCloudData` (`word`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);