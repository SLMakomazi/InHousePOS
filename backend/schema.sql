-- Create database
CREATE DATABASE IF NOT EXISTS inhousepos;
USE inhousepos;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  role ENUM('admin', 'user') DEFAULT 'user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  clientName VARCHAR(100) NOT NULL,
  clientEmail VARCHAR(100),
  clientContact VARCHAR(20),
  startDate DATE,
  endDate DATE,
  status ENUM('draft', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
  budget DECIMAL(10,2),
  actualCost DECIMAL(10,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Contracts table
CREATE TABLE contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT,
  userId INT,
  contractNumber VARCHAR(50) UNIQUE NOT NULL,
  projectName VARCHAR(100) NOT NULL,
  clientName VARCHAR(100) NOT NULL,
  clientEmail VARCHAR(100),
  termsAndConditions TEXT,
  status ENUM('draft', 'sent', 'approved', 'rejected') DEFAULT 'draft',
  amount DECIMAL(10,2),
  paymentSchedule TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Invoices table
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT,
  userId INT,
  invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
  projectName VARCHAR(100) NOT NULL,
  clientName VARCHAR(100) NOT NULL,
  clientEmail VARCHAR(100),
  status ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
  totalAmount DECIMAL(10,2) NOT NULL,
  dueDate DATE,
  paymentTerms TEXT,
  paymentMethod VARCHAR(50),
  paymentStatus ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Invoice items table
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT,
  description TEXT NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  taxRate DECIMAL(5,2),
  taxAmount DECIMAL(10,2),
  FOREIGN KEY (invoiceId) REFERENCES invoices(id)
);

-- Payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT,
  userId INT,
  amount DECIMAL(10,2) NOT NULL,
  paymentDate DATE,
  paymentMethod VARCHAR(50),
  referenceNumber VARCHAR(100),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Milestones table
CREATE TABLE milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  dueDate DATE,
  status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
  assignedTo INT,
  completedDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (assignedTo) REFERENCES users(id)
);

-- Documents table
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT,
  userId INT,
  documentType ENUM('contract', 'invoice', 'proposal', 'other') NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  description TEXT,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Insert predefined admin user
INSERT INTO users (username, password, email, firstName, lastName, role, status)
VALUES (
  'admin',  
  '$2a$10$MWYh8ABMCctK8/IWGGEXqOITVTqi.WqyRvJjVdXldeThaaWosIr7G', 
  'lutho.makomazi@gmail.com', 
  'Siseko',
  'Makomazi',
  'admin',
  'active'
);