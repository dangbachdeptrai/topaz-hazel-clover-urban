create table if not exists exams (
  id text primary key,
  title text not null,
  exam_type text not null,
  duration_seconds int not null default 1500,
  total_questions int not null default 0,
  description text not null default '',
  author_name text not null default '',
  source_label text not null default '',
  is_public boolean not null default true,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id text primary key,
  exam_id text not null references exams(id) on delete cascade,
  order_index int not null,
  content text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer char(1) not null,
  explanation text not null default '',
  topic text not null default '',
  difficulty text not null default 'medium',
  score numeric not null default 0.25
);
create index if not exists questions_exam_idx on questions (exam_id, order_index);
create index if not exists questions_topic_idx on questions (topic, difficulty);

create table if not exists exam_attempts (
  id text primary key,
  exam_id text not null references exams(id),
  user_id text not null,
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  time_spent_seconds int
);
create index if not exists attempts_user_idx on exam_attempts (user_id, submitted_at desc);

create table if not exists profiles (
  user_id text primary key,
  display_name text not null default 'Đạo hữu',
  dao_title text not null default '',
  realm_id text not null default 'luyen_khi',
  realm_layer int not null default 1,
  exp int not null default 0,
  elo int not null default 1000,
  linh_thach int not null default 0,
  pvp_wins int not null default 0,
  pvp_losses int not null default 0,
  pvp_draws int not null default 0,
  win_streak int not null default 0,
  best_streak int not null default 0,
  tower_best_floor int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists perk_catalog (
  id text primary key,
  name text not null,
  han text not null,
  blurb text not null,
  effect text not null,
  value numeric not null,
  min_realm text not null,
  cost int not null default 0
);

insert into perk_catalog (id, name, han, blurb, effect, value, min_realm, cost) values
  ('bang_tam', 'Băng Tâm Quyết', '冰心訣', 'Thêm 5 giây mỗi trận và mỗi tầng tháp.', 'time', 5, 'luyen_khi', 0),
  ('minh_nhan', 'Minh Nhãn', '明眼', 'Loại một đáp án sai trên mỗi câu.', 'eliminate', 1, 'luyen_khi', 12),
  ('linh_van', 'Linh Vân Bộ', '靈雲步', 'Thắng trận hoặc vượt tầng thêm 2 Linh Thạch.', 'thach', 2, 'luyen_khi', 8),
  ('kim_than', 'Kim Thân Quyết', '金身訣', 'Tu Vi nhận thêm 15%. Mở từ Trúc Cơ.', 'exp', 0.15, 'truc_co', 24)
on conflict (id) do nothing;

create table if not exists user_perks (
  user_id text not null,
  perk_id text not null references perk_catalog(id),
  equipped boolean not null default false,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, perk_id)
);

create table if not exists linh_thach_ledger (
  id text primary key,
  user_id text not null,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists pvp_matches (
  id text primary key,
  exam_id text not null references exams(id),
  player1_id text not null,
  player1_name text not null,
  player2_id text,
  player2_name text,
  player1_score numeric not null default 0,
  player2_score numeric not null default 0,
  player1_answers jsonb not null default '{}'::jsonb,
  player2_answers jsonb not null default '{}'::jsonb,
  player1_done boolean not null default false,
  player2_done boolean not null default false,
  start_time timestamptz,
  end_time timestamptz,
  countdown_ends_at timestamptz,
  winner_id text,
  status text not null default 'waiting',
  room_code text not null,
  duration_seconds int not null default 480,
  is_bot boolean not null default false,
  mode text not null default 'casual',
  p1_elo_before int,
  p2_elo_before int,
  p1_elo_after int,
  p2_elo_after int,
  p1_exp_gain int,
  p2_exp_gain int,
  created_at timestamptz not null default now()
);
create index if not exists pvp_players_idx on pvp_matches (player1_id, player2_id, status);

create table if not exists pvp_queue (
  user_id text primary key,
  user_name text not null,
  exam_id text not null,
  joined_at timestamptz not null default now(),
  topic_filter text,
  difficulty_filter text,
  question_count int,
  mode text not null default 'casual',
  elo int not null default 1000,
  realm_id text not null default 'luyen_khi'
);

create table if not exists tower_runs (
  id text primary key,
  user_id text not null,
  floor int not null,
  status text not null default 'in_progress',
  lives int not null default 1,
  question_ids jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  q_index int not null default 0,
  correct_count int not null default 0,
  ends_at timestamptz not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists tower_user_idx on tower_runs (user_id, started_at desc);

create table if not exists documents (
  id text primary key,
  user_id text not null,
  title text not null,
  mime text not null,
  size_bytes int not null,
  data_b64 text not null,
  created_at timestamptz not null default now()
);
create index if not exists documents_user_idx on documents (user_id, created_at desc);

create table if not exists tutor_threads (
  id text primary key,
  user_id text not null unique,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
