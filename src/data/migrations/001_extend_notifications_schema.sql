-- Migration 001: Extend Notifications Schema
-- This migration extends the existing notifications system with recurring notifications and event reminders

-- 1. Extend existing notifications table
ALTER TABLE notifications 
ADD COLUMN isPaused BOOLEAN DEFAULT FALSE AFTER isActive,
ADD COLUMN sourceType ENUM('manual', 'event_start', 'event_end') DEFAULT 'manual' AFTER tags,
ADD COLUMN sourceId INT NULL AFTER sourceType;

-- Add indexes for the new columns
ALTER TABLE notifications 
ADD INDEX idx_source (sourceType, sourceId),
ADD INDEX idx_recurring (frequency, isActive, isPaused);

-- 2. Create recurring_notification_templates table
CREATE TABLE recurring_notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    isPaused BOOLEAN DEFAULT FALSE,
    
    -- Scheduling configuration
    showTime TIME NOT NULL,
    weekdays VARCHAR(20) NULL COMMENT 'Comma-separated weekdays: 1,2,3,4,5',
    monthDay INT NULL COMMENT 'Day of month: 1-31',
    
    -- Execution control
    lastExecuted DATETIME NULL,
    nextExecution DATETIME NOT NULL,
    executionCount INT DEFAULT 0,
    maxExecutions INT NULL,
    
    -- Metadata
    priority INT DEFAULT 1,
    category VARCHAR(100) NULL,
    tags TEXT NULL,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_execution (isActive, isPaused, nextExecution),
    INDEX idx_frequency (frequency, isActive),
    INDEX idx_category (category),
    INDEX idx_priority (priority)
);

-- 3. Create event_reminders table
CREATE TABLE event_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eventId INT NOT NULL,
    eventName VARCHAR(255) NOT NULL,
    reminderType ENUM('start', 'end') NOT NULL,
    triggerDate DATETIME NOT NULL,
    notificationId INT NULL,
    isProcessed BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to notifications table
    FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_processing (isProcessed, triggerDate),
    INDEX idx_event (eventId),
    INDEX idx_trigger_date (triggerDate),
    
    -- Unique constraint to prevent duplicate reminders
    UNIQUE KEY unique_event_reminder (eventId, reminderType)
);

-- 4. Add comments for documentation
ALTER TABLE notifications COMMENT = 'Enhanced notifications table with recurring and event-based notifications';
ALTER TABLE recurring_notification_templates COMMENT = 'Templates for recurring notifications with scheduling configuration';
ALTER TABLE event_reminders COMMENT = 'Automatic reminders for project events and deadlines';