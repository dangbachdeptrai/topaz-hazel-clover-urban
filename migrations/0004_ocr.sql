alter table documents add column if not exists ocr_json jsonb;
alter table documents add column if not exists ocr_at timestamptz;
alter table documents add column if not exists ocr_exam_id text;
