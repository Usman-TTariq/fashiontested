-- Add coupon display order array to stores (Phase C/D)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS coupon_order UUID[] DEFAULT NULL;
