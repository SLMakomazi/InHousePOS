-- Add new columns to contracts table
ALTER TABLE contracts
ADD COLUMN title VARCHAR(255) AFTER contractNumber,
ADD COLUMN description TEXT AFTER title,
ADD COLUMN startDate DATE AFTER description,
ADD COLUMN endDate DATE AFTER startDate,
ADD COLUMN terms TEXT AFTER endDate,
ADD COLUMN notes TEXT AFTER terms,
ADD COLUMN clientId INT AFTER projectId,
ADD COLUMN clientPhone VARCHAR(20) AFTER clientEmail,
ADD COLUMN clientAddress TEXT AFTER clientPhone,
MODIFY COLUMN amount DECIMAL(12,2) DEFAULT 0.00,
MODIFY COLUMN status ENUM('draft', 'sent', 'approved', 'rejected', 'signed', 'expired') DEFAULT 'draft',
MODIFY COLUMN termsAndConditions TEXT NULL,
MODIFY COLUMN projectName VARCHAR(255) NULL,
MODIFY COLUMN clientName VARCHAR(255) NULL,
MODIFY COLUMN clientEmail VARCHAR(255) NULL,
ADD CONSTRAINT fk_contract_client FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE SET NULL;

-- Create contract_items table
CREATE TABLE IF NOT EXISTS contract_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contractId INT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unitPrice DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unitPrice) STORED,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create contract_history table
CREATE TABLE IF NOT EXISTS contract_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contractId INT NOT NULL,
  userId INT,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  oldValues JSON,
  newValues JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_contracts_project ON contracts(projectId);
CREATE INDEX idx_contracts_client ON contracts(clientId);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contract_items_contract ON contract_items(contractId);
CREATE INDEX idx_contract_history_contract ON contract_history(contractId);

-- Add triggers for contract history
DELIMITER //
CREATE TRIGGER after_contract_insert
AFTER INSERT ON contracts
FOR EACH ROW
BEGIN
  INSERT INTO contract_history (
    contractId, 
    action, 
    description, 
    newValues,
    ipAddress,
    userAgent
  ) 
  VALUES (
    NEW.id, 
    'CREATE', 
    'Contract created',
    JSON_OBJECT(
      'contractNumber', NEW.contractNumber,
      'title', NEW.title,
      'status', NEW.status,
      'amount', NEW.amount
    ),
    @_client_ip,
    @_client_user_agent
  );
END //


CREATE TRIGGER after_contract_update
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
  DECLARE changes JSON;
  
  -- Only log if there are actual changes
  IF (OLD.contractNumber != NEW.contractNumber OR
      OLD.title != NEW.title OR
      OLD.description != NEW.description OR
      OLD.status != NEW.status OR
      OLD.amount != NEW.amount) THEN
      
    SET changes = JSON_OBJECT(
      'contractNumber', JSON_OBJECT('old', OLD.contractNumber, 'new', NEW.contractNumber),
      'title', JSON_OBJECT('old', OLD.title, 'new', NEW.title),
      'status', JSON_OBJECT('old', OLD.status, 'new', NEW.status),
      'amount', JSON_OBJECT('old', OLD.amount, 'new', NEW.amount)
    );
    
    INSERT INTO contract_history (
      contractId, 
      userId,
      action, 
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent
    ) 
    VALUES (
      NEW.id,
      @_user_id,
      'UPDATE',
      'Contract updated',
      JSON_OBJECT(
        'contractNumber', OLD.contractNumber,
        'title', OLD.title,
        'status', OLD.status,
        'amount', OLD.amount
      ),
      JSON_OBJECT(
        'contractNumber', NEW.contractNumber,
        'title', NEW.title,
        'status', NEW.status,
        'amount', NEW.amount
      ),
      @_client_ip,
      @_client_user_agent
    );
  END IF;
END //


CREATE TRIGGER before_contract_delete
BEFORE DELETE ON contracts
FOR EACH ROW
BEGIN
  -- Log the deletion
  INSERT INTO contract_history (
    contractId,
    userId,
    action,
    description,
    oldValues,
    ipAddress,
    userAgent
  )
  VALUES (
    OLD.id,
    @_user_id,
    'DELETE',
    'Contract deleted',
    JSON_OBJECT(
      'contractNumber', OLD.contractNumber,
      'title', OLD.title,
      'status', OLD.status,
      'amount', OLD.amount
    ),
    @_client_ip,
    @_client_user_agent
  );
  
  -- Delete related items to prevent foreign key constraint violation
  DELETE FROM contract_items WHERE contractId = OLD.id;
END //

DELIMITER ;
