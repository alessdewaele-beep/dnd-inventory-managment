-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generated on: 17 May 2026 at 10:41
-- Server version: 8.0.46
-- PHP version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dnd`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `userId` int NOT NULL,
  `favourite` tinyint(1) NOT NULL,
  `quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data being exported for table `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `type`, `created_at`, `userId`, `favourite`, `quantity`) VALUES
(28, 'Oathbound pendant', 'Wondrous Item (Amulet), Vestige of Divergence (requires attunement by a Blood Hunter)\nA cracked ruby heart hangs on an iron chain. It weeps blood under moonlight.\n\nDormant\nWhile below half HP: \n+1 to attack rolls and saves.\nCrimson Rite deals +1 additional damage die (1/turn).\n\nAwakened\nOnce per long rest, enter Bloodbonded Frenzy (bonus action, 1 min):\n+2 AC, +10 ft movement\nAttacks deal +1d6 psychic\nReroll one failed save per frenzy\nOn 0 HP, roll d6; on a 6, stay at 1 HP.\n\nExalted\nFrenzy lasts 2 minutes, use 2x per long rest.\nWhile Frenzied:\nResistance to all damage (1st round).\nCrits heal for Crimson Rite damage.\nOnce per long rest: summon a phantom echo of your lost love (flavorful spirit companion, DM discretion).\nRP Hook: At night, the pendant hums with memories. If worn during a full moon, it may reveal dreams of a forgotten bond.', 'jewelry', '2025-09-09 03:00:31', 0, 1, 1),
(29, 'Longbow +1', '+7 attack, 1d8+4 piercing, a black bow created with a special ebony wood', 'weapon ranged', '2025-09-09 05:03:26', 0, 1, 1),
(30, 'Longsword (odachi)', '+6 attack, 1d10+3 slashing, a special longsword created for Sunless, there exist only one of its kind', 'weapon melee', '2025-09-09 01:03:59', 0, 1, 1),
(31, 'Hide', 'Hide taken from a big animal', 'misc', '2025-09-09 09:06:12', 0, 0, 1),
(32, 'Dagger', '+6 attack, 1d4+3 piercing', 'weapon melee', '2025-09-09 09:07:38', 0, 0, 1),
(33, 'Bedroll', 'A bedroll ', 'misc', '2025-09-09 09:08:02', 0, 0, 1),
(34, 'Mess Kit', 'Mess Kit', 'misc', '2025-09-09 09:08:16', 0, 0, 1),
(35, 'Alchemist supplies', 'A selection of basic alchemist supplies', 'misc', '2025-09-09 09:08:49', 0, 0, 1),
(36, 'Rope 50 feet', '50 feet if rope', 'misc', '2025-09-09 09:09:25', 0, 0, 1),
(37, 'Tinderbox', 'A box with tinder to start a small fire', 'misc', '2025-09-09 09:10:04', 0, 0, 1),
(38, 'Torch', 'Torch to create a small area of light', 'misc', '2025-09-09 07:10:33', 0, 0, 10),
(39, 'Security pins', 'Securtiy pins to secure places in ice or rock', 'misc', '2025-09-09 09:11:24', 0, 0, 8),
(41, 'Communication horn', 'A horn to communicate with a samelike horn', 'misc', '2025-09-09 07:12:51', 0, 1, 1),
(42, 'Magic staff', 'A magic staff taken from an enemy', 'weapon ranged', '2025-09-09 09:14:01', 0, 0, 1),
(43, 'Shadow cloak', 'A cloak that lets you slip into the shadows, gives +1 initiative and 1 action to turn invisibile in shadowy places', 'armor light', '2025-09-09 07:15:12', 0, 1, 1),
(44, 'White fur coat ', 'A fur coat created from a leopard skin, very expensive', 'misc', '2025-09-09 07:16:43', 0, 1, 1),
(45, 'Rode rozen ', 'Rode!!! rozen die sunless kan zien, ruiken naar parfum van een liefde lang verloren, druppen rode vloeistof die acid achtig is.', 'misc', '2025-09-11 10:14:03', 0, 0, 3),
(47, 'Fakka bro', 'target shits pants\n\nbecome firghtened', 'weapon ranged', '2025-09-14 18:31:24', 11, 0, 1),
(50, 'Dose of poison', 'Deals 1d4 posion damage', 'misc', '2025-10-02 17:48:48', 0, 1, 6),
(51, 'Rough wooden statue of a wolf', 'A rough statue of a mystical wolf based on a statue from Richard', 'misc', '2025-10-02 18:00:27', 0, 0, 1),
(54, 'chicken nuggets', 'ik slik kip', 'weapon melee', '2025-11-30 16:00:35', 12, 0, 69);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Role` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data being exported for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`, `Role`) VALUES
(0, 'Sunless', '$2b$10$jW1utHXzhUsBoZp6roxdtOs5QsRpZXGDG./B7.7g54RZywAVbMvre', '2025-09-14 13:12:37', 'Player'),
(11, 'DM', '$2b$10$s8zLhsXkyWI3Z5.I39xPLuFebp/xmdKawHep6.Mxpqx0AXLrkK/eS', '2025-09-14 18:29:08', 'DM'),
(12, 'Bob', '$2b$10$jBt5BkmFYaOYU9Vp3TnL1u0pMRxJWARkQ02gsBjbIKPEUhEZ1v8RW', '2025-09-14 19:08:05', 'Player'),
(13, 'Dorel', '$2b$10$UeK6YI0yoArkjquHnqw98u/DLUmKehhh/NZ8EcaIa8YE0/HRWpAv2', '2025-12-06 18:11:58', 'Player');

--
-- Indexes for exported tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for exported tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
