-- Create hafalan_records table
CREATE TABLE public.hafalan_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    date DATE NOT NULL,
    surah TEXT NOT NULL,
    ayat TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create murajaah_records table
CREATE TABLE public.murajaah_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    date DATE NOT NULL,
    surah TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Lancar', 'Kurang Lancar', 'Tidak Lancar')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hafalan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murajaah_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this school app)
CREATE POLICY "Allow public read hafalan" 
ON public.hafalan_records 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert hafalan" 
ON public.hafalan_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update hafalan" 
ON public.hafalan_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete hafalan" 
ON public.hafalan_records 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read murajaah" 
ON public.murajaah_records 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert murajaah" 
ON public.murajaah_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update murajaah" 
ON public.murajaah_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete murajaah" 
ON public.murajaah_records 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_hafalan_student_id ON public.hafalan_records(student_id);
CREATE INDEX idx_hafalan_date ON public.hafalan_records(date DESC);
CREATE INDEX idx_murajaah_student_id ON public.murajaah_records(student_id);
CREATE INDEX idx_murajaah_date ON public.murajaah_records(date DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hafalan_records_updated_at
BEFORE UPDATE ON public.hafalan_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_murajaah_records_updated_at
BEFORE UPDATE ON public.murajaah_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();