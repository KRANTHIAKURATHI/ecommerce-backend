-- Compatible MySQL Dump
-- Created from backup.sql
-- This version is compatible with older MySQL versions

SET FOREIGN_KEY_CHECKS=0;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(250) NOT NULL,
  `phonenumber` varchar(15) NOT NULL,
  `emailID` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'customer',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `phonenumber` (`phonenumber`),
  UNIQUE KEY `emailID` (`emailID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

INSERT INTO `user` VALUES (1,'kranthi','7539521896','kranthiakurathi05@gmail.com','123456789','user'),(2,'teja','1234567892','freefireteluguclub99@gmail.com','12345678965','user'),(3,'vinay','1234567894','vinay15@gmail.com','1234567','user'),(4,'shanmukharao','1234567891','shanmukharao125@gmail.com','123456789','user'),(5,'Subhashini','9493442919','subhashini2009@gmail.com','$$Pk2005?','customer'),(6,'kranthi akurathi','0000000000','akurathikranthi12@gmail.com','OAUTH_USER','customer');

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(250) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

INSERT INTO `category` VALUES (3,'Beauty & Personal Care'),(1,'Electronics'),(2,'Fashion'),(4,'Home & Kitchen'),(5,'Toys');

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `imageURL` varchar(250) DEFAULT NULL,
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

INSERT INTO `product` VALUES (1,1,2499.00,'Bluetooth Headphones','headphones.jpeg',0.00,0),(2,1,3499.00,'Smart Watch','smartwatch.jpeg',0.00,0),(3,2,1799.00,'Men\'s Sneakers','sneakers.jpeg',0.00,0),(4,2,2299.00,'Women\'s Handbag','handbag.jpeg',0.00,0),(5,3,299.00,'Aloe Vera Face Wash','facewash.jpeg',0.00,0),(6,3,399.00,'Hair Serum','hairserum.jpeg',0.00,0),(7,4,799.00,'Electric Kettle','kettle.jpeg',0.00,0),(8,4,599.00,'LED Table Lamp','lamp.jpeg',0.00,0),(9,5,1199.00,'Remote Control Car','rccar.jpeg',0.00,0),(10,5,699.00,'Stuffed Teddy Bear','teddybear.jpeg',0.00,0);

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

INSERT INTO `cart` VALUES (1,1),(4,2),(5,3),(2,5),(3,6);

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `cart_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`cart_item_id`),
  KEY `fk_cart_items_cart` (`cart_id`),
  KEY `fk_cart_items_product` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8;

INSERT INTO `orders` VALUES (1,1,299.00,'2025-07-11 23:59:35'),(2,1,14689.00,'2025-07-12 00:11:50'),(3,1,1199.00,'2025-07-12 00:13:04'),(4,1,2499.00,'2025-07-12 00:17:42'),(5,1,3499.00,'2025-07-12 00:25:07'),(6,1,3499.00,'2025-07-12 00:27:23'),(7,1,3698.00,'2025-07-12 09:28:52'),(8,1,6696.00,'2025-07-12 12:47:54'),(9,1,6296.00,'2025-07-12 23:43:54'),(10,1,299.00,'2025-07-12 23:53:58'),(11,1,299.00,'2025-07-12 23:57:31'),(12,1,4597.00,'2025-07-13 00:08:34'),(13,1,1199.00,'2025-07-13 00:08:48'),(14,1,299.00,'2025-07-13 00:13:33'),(15,1,1799.00,'2025-07-13 00:13:45'),(16,1,2499.00,'2025-07-14 14:59:41'),(17,1,1799.00,'2025-07-14 15:36:19'),(18,1,299.00,'2025-07-14 15:36:55'),(19,1,599.00,'2025-07-14 15:39:21'),(20,1,399.00,'2025-07-14 15:39:32'),(21,1,399.00,'2025-07-14 15:40:24'),(22,1,299.00,'2025-07-14 15:40:59'),(23,1,399.00,'2025-07-14 15:41:10'),(24,1,399.00,'2025-07-14 15:42:19'),(25,1,299.00,'2025-07-14 15:42:25'),(26,1,2299.00,'2025-07-14 15:42:31'),(27,1,299.00,'2025-07-14 15:51:29'),(28,1,2499.00,'2025-07-14 15:51:54'),(29,1,2499.00,'2025-07-14 15:53:49'),(30,1,2499.00,'2025-07-14 15:53:57'),(31,1,3499.00,'2025-07-14 15:55:05'),(36,1,2499.00,'2025-07-14 16:37:09'),(38,1,1799.00,'2025-07-14 16:43:54'),(39,1,3499.00,'2025-07-14 16:44:36'),(43,1,3499.00,'2025-07-14 17:06:45'),(47,1,2299.00,'2025-07-14 17:20:09'),(50,1,3796.00,'2025-07-14 20:07:46'),(51,1,8995.00,'2025-07-14 20:08:27'),(52,1,799.00,'2025-07-14 20:13:41'),(53,1,4298.00,'2025-07-14 20:14:18'),(54,1,299.00,'2025-07-14 20:57:14'),(55,1,699.00,'2025-07-15 19:40:54'),(56,5,1799.00,'2025-12-06 22:50:19'),(57,5,2299.00,'2025-12-06 22:50:35'),(58,1,3298.00,'2026-01-14 12:47:01'),(59,6,1998.00,'2026-01-14 20:27:35'),(60,6,2299.00,'2026-01-14 22:54:06'),(61,6,3499.00,'2026-01-14 22:56:45'),(62,6,2299.00,'2026-01-14 22:59:17'),(63,6,2499.00,'2026-01-15 22:47:11'),(64,6,6797.00,'2026-01-15 22:47:16'),(65,6,2499.00,'2026-01-15 22:58:12'),(66,6,3197.00,'2026-01-15 23:06:38'),(67,6,399.00,'2026-01-15 23:11:51'),(68,6,3499.00,'2026-01-15 23:14:04'),(69,6,2499.00,'2026-01-15 23:24:10'),(70,6,3499.00,'2026-01-15 23:29:18'),(71,6,3598.00,'2026-01-15 23:29:45'),(72,6,299.00,'2026-01-17 16:32:55'),(73,6,299.00,'2026-01-17 16:40:43'),(74,6,3794.00,'2026-01-17 16:54:03'),(75,6,1799.00,'2026-01-17 16:56:29'),(76,6,2299.00,'2026-01-17 16:56:40'),(77,1,12996.00,'2026-01-17 21:38:34'),(78,6,2499.00,'2026-01-17 21:39:23'),(79,2,1799.00,'2026-01-17 21:40:28'),(80,3,399.00,'2026-01-17 21:45:18'),(81,6,699.00,'2026-01-19 20:28:52');

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `order_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_item_order` (`order_id`),
  KEY `fk_order_item_product` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8;

INSERT INTO `order_item` VALUES (1,5,1,1),(2,6,2,1),(3,8,2,1),(4,1,2,1),(5,2,2,1),(6,3,2,1),(7,4,2,1),(8,5,2,1),(9,7,2,1),(10,9,2,1),(11,10,2,1),(12,9,3,1),(13,1,4,1),(14,2,5,1),(15,2,6,1),(16,1,7,1),(17,9,7,1),(18,5,8,1),(19,6,8,1),(20,1,8,1),(21,2,8,1),(22,9,9,1),(23,4,9,1),(24,1,9,1),(25,5,9,1),(26,5,10,1),(27,5,11,1),(28,5,12,1),(29,3,12,1),(30,1,12,1),(31,9,13,1),(32,5,14,1),(33,3,15,1),(34,1,16,1),(35,3,17,1),(36,5,18,1),(37,8,19,1),(38,6,20,1),(39,6,21,1),(40,5,22,1),(41,6,23,1),(42,6,24,1),(43,5,25,1),(44,4,26,1),(45,5,27,1),(46,1,28,1),(47,1,29,1),(48,1,30,1),(49,2,31,1),(62,1,36,1),(66,3,38,1),(67,2,39,1),(78,2,43,1),(91,4,47,1),(100,1,50,1),(101,8,50,1),(102,5,50,1),(103,6,50,1),(104,3,51,1),(105,4,51,1),(106,2,51,1),(107,8,51,1),(108,7,51,1),(109,7,52,1),(110,7,53,1),(111,2,53,1),(112,5,54,1),(113,10,55,1),(114,3,56,1),(115,4,57,1),(116,7,58,1),(117,1,58,1),(118,9,59,1),(119,7,59,1),(120,4,60,1),(121,2,61,1),(122,4,62,1),(123,1,63,1),(124,1,64,1),(125,3,64,1),(126,1,64,1),(127,1,65,1),(128,6,66,1),(129,1,66,1),(130,5,66,1),(131,6,67,1),(132,2,68,1),(133,1,69,1),(134,2,70,1),(135,3,71,1),(136,3,71,1),(137,5,72,5),(138,5,73,4),(139,5,74,5),(140,4,74,1),(141,3,75,1),(142,4,76,10),(143,2,77,3),(144,1,77,1),(145,1,78,1),(146,3,79,1),(147,6,80,1),(148,10,81,1);

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `idx_product_reviews` (`product_id`),
  KEY `idx_user_reviews` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

INSERT INTO `reviews` VALUES (1,3,6,5,'Awesome product, I like this.','2026-01-17 16:06:06','2026-01-17 16:06:06'),(2,1,1,5,NULL,'2026-01-17 16:08:59','2026-01-17 16:08:59'),(3,6,3,5,'This product is nice.','2026-01-17 16:15:34','2026-01-17 16:15:34'),(4,10,6,4,'Soft Teddy doll.','2026-01-19 14:59:20','2026-01-19 14:59:31');

SET FOREIGN_KEY_CHECKS=1;
