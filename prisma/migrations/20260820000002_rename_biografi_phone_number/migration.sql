-- Preserve existing phone numbers and the previous migration history.
ALTER TABLE `Biografi`
    CHANGE COLUMN `phonenumber` `phoneNumber` VARCHAR(20) NOT NULL;
