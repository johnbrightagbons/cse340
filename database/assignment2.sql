-- Step 1: Insert 'Tony Stark' into the 'account' table
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Step 2: Update Tony's account_type to Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';
-- Step 3: Delete the Tony Stark record from the database
DELETE FROM account
WHERE account_firstname = 'Tony';
-- Step 4: Modify the "GM Hummer" record 
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_model = 'GM Hummer';
-- Step 5: Use an inner join to select the make and model fields from the 
-- inventory table and the classification name field 
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- Step 6:  Update all records in the inventory table to add "/vehicles" to the middle of the 
-- file path in the inv_image and 
-- inv_thumbnail columns using a single query.
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')