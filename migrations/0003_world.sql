alter table profiles add column if not exists guild_id text;
alter table profiles add column if not exists equipped_frame text not null default '';
alter table profiles add column if not exists br_wins int not null default 0;
alter table profiles add column if not exists br_best_place int;

create table if not exists guilds (
  id text primary key,
  name text not null,
  tag text not null unique,
  motto text not null default '',
  invite_code text not null unique,
  leader_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists guilds_leader_idx on guilds (leader_id);

create table if not exists guild_members (
  guild_id text not null references guilds(id) on delete cascade,
  user_id text not null unique,
  role text not null default 'member',
  contribution int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);
create index if not exists guild_members_user_idx on guild_members (user_id);

create table if not exists shop_items (
  id text primary key,
  kind text not null,
  name text not null,
  han text not null,
  blurb text not null,
  cost int not null
);

insert into shop_items (id, kind, name, han, blurb, cost) values
  ('jade', 'frame', 'Ngọc Bích Ấn', '玉碧印', 'Viền ngọc quanh đạo ảnh.', 12),
  ('gold', 'frame', 'Kim Quang', '金光圈', 'Hào quang kim quanh đạo ảnh.', 24),
  ('void', 'frame', 'Hư Không Màn', '虛空幕', 'Viền khói huyền ảo.', 36),
  ('crimson', 'frame', 'Huyết Ấn', '血印', 'Viền đỏ sát khí Lôi Đài.', 18)
on conflict (id) do nothing;

create table if not exists user_inventory (
  user_id text not null,
  item_id text not null references shop_items(id),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists br_rooms (
  id text primary key,
  exam_id text not null references exams(id),
  status text not null default 'countdown',
  capacity int not null default 8,
  round_index int not null default 0,
  question_ids jsonb not null default '[]'::jsonb,
  countdown_ends_at timestamptz,
  round_ends_at timestamptz,
  winner_id text,
  rewarded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists br_rooms_status_idx on br_rooms (status, created_at desc);

create table if not exists br_players (
  room_id text not null references br_rooms(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  is_bot boolean not null default false,
  is_alive boolean not null default true,
  answer text,
  answered_at timestamptz,
  correct_count int not null default 0,
  placement int,
  eliminated_round int,
  primary key (room_id, user_id)
);
create index if not exists br_players_user_idx on br_players (user_id, room_id);

create table if not exists br_queue (
  user_id text primary key,
  user_name text not null,
  elo int not null default 1000,
  joined_at timestamptz not null default now()
);
