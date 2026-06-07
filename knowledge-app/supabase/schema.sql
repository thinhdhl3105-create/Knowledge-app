-- ============================================================
-- Knowledge Management - Supabase Schema
-- Chạy file này trong: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Tạo bảng notes
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text,
  topic       text,
  tags        text[] default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Index để tìm kiếm/sắp xếp nhanh
create index if not exists notes_created_at_idx on public.notes (created_at desc);
create index if not exists notes_topic_idx on public.notes (topic);

-- 3. Tự động cập nhật updated_at mỗi khi sửa
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- 4. Bật Row Level Security
alter table public.notes enable row level security;

-- 5. Policy: cho phép mọi người đọc/ghi (phù hợp app nhập liệu cá nhân, không đăng nhập)
--    LƯU Ý: cấu hình này cho phép bất kỳ ai có anon key đều thao tác được.
--    Nếu cần bảo mật theo người dùng, hãy bật Supabase Auth và đổi policy.
drop policy if exists "Allow public read"   on public.notes;
drop policy if exists "Allow public insert" on public.notes;
drop policy if exists "Allow public update" on public.notes;
drop policy if exists "Allow public delete" on public.notes;

create policy "Allow public read"   on public.notes for select using (true);
create policy "Allow public insert" on public.notes for insert with check (true);
create policy "Allow public update" on public.notes for update using (true);
create policy "Allow public delete" on public.notes for delete using (true);
