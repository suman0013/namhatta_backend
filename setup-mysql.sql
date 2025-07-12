-- MySQL Database Setup Script for Namhatta Management System
-- Run this script in your MySQL client to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS namhatta_management;

-- Use the database
USE namhatta_management;

-- Create a user for the application (optional, you can use root)
-- CREATE USER 'namhatta_user'@'localhost' IDENTIFIED BY 'namhatta_password';
-- GRANT ALL PRIVILEGES ON namhatta_management.* TO 'namhatta_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show success message
SELECT 'Database setup completed successfully!' AS message;