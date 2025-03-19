-- Insert Tony Shark into the account table
INSERT INTO public.account (
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
-- Update and Change tony stark to admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
-- To remove tony from the account table
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';
-- modify the "GM Hummer" record and change "small interiors" to "a huge interior" using the REPLACE function
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
-- Use an inner join to select the make 
-- and model fields from the inventory table and the classification name field from the classification 
-- table for inventory items that belong 
-- to the "Sport" category.
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM public.inventory i
    INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- Update all records in the inventory
-- table to add "/vehicles" to the 
-- middle of the file path in the 
-- inv_image and inv_thumbnail columns 
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');