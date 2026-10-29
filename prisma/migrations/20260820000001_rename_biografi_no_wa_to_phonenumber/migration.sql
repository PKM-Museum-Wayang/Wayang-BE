-- Rename the existing column without dropping stored phone numbers.
ALTER TABLE `Biografi`
    CHANGE COLUMN `noWa` `phonenumber` VARCHAR(20) NOT NULL;
