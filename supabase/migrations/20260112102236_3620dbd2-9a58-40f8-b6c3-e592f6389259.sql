-- Add type column to murajaah_records to differentiate between class and home murajaah
ALTER TABLE public.murajaah_records 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'home';

-- Add check constraint for valid types
ALTER TABLE public.murajaah_records 
ADD CONSTRAINT murajaah_type_check CHECK (type IN ('home', 'class'));

-- Create index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_murajaah_records_type ON public.murajaah_records(type);