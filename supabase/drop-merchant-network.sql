-- Remove deprecated merchant/network columns from stores (Phase A)
ALTER TABLE stores DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE stores DROP COLUMN IF EXISTS network_id;
