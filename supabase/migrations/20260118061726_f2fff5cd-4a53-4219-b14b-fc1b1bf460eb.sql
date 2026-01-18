-- Allow score=0 for absences
ALTER TABLE public.hafalan_records
DROP CONSTRAINT IF EXISTS hafalan_records_score_check;

ALTER TABLE public.hafalan_records
ADD CONSTRAINT hafalan_records_score_check
CHECK (score >= 0 AND score <= 100);