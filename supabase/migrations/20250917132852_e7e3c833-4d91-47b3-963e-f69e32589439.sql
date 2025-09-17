-- Add district and village columns to farmers table
ALTER TABLE public.farmers ADD COLUMN district text;
ALTER TABLE public.farmers ADD COLUMN village text;

-- Update the existing location column to be optional since we'll have district/village
ALTER TABLE public.farmers ALTER COLUMN location DROP NOT NULL;