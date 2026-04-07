-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create People Table
create table if not exists public.people (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  role text,
  organization text,
  notes text,
  documents text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Meetings Table
create table if not exists public.meetings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  datetime timestamp with time zone not null,
  notes text,
  transcript text,
  decisions text,
  action_items text,
  contribution text,
  documents text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Entries Table
create table if not exists public.entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  work_logs jsonb default '[]'::jsonb, -- array of {text, project, tags, timeSpent}
  impact text,
  challenges text,
  learnings text,
  documents text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS)
alter table public.people enable row level security;
alter table public.meetings enable row level security;
alter table public.entries enable row level security;

-- Create Policies for Isolation
-- People
create policy "Users can view their own people" on public.people for select using (auth.uid() = user_id);
create policy "Users can insert their own people" on public.people for insert with check (auth.uid() = user_id);
create policy "Users can update their own people" on public.people for update using (auth.uid() = user_id);
create policy "Users can delete their own people" on public.people for delete using (auth.uid() = user_id);

-- Meetings
create policy "Users can view their own meetings" on public.meetings for select using (auth.uid() = user_id);
create policy "Users can insert their own meetings" on public.meetings for insert with check (auth.uid() = user_id);
create policy "Users can update their own meetings" on public.meetings for update using (auth.uid() = user_id);
create policy "Users can delete their own meetings" on public.meetings for delete using (auth.uid() = user_id);

-- Entries
create policy "Users can view their own entries" on public.entries for select using (auth.uid() = user_id);
create policy "Users can insert their own entries" on public.entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own entries" on public.entries for update using (auth.uid() = user_id);
create policy "Users can delete their own entries" on public.entries for delete using (auth.uid() = user_id);

-- 4. Create Tasks Table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  due_date date,
  priority text default 'medium',
  status text default 'todo',
  project text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;
create policy "Users can view their own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Storage configuration
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict do nothing;

create policy "Users can upload their own documents" on storage.objects for insert with check (bucket_id = 'documents' and auth.uid() = owner);
create policy "Users can update their own documents" on storage.objects for update using (bucket_id = 'documents' and auth.uid() = owner);
create policy "Users can delete their own documents" on storage.objects for delete using (bucket_id = 'documents' and auth.uid() = owner);
create policy "Anyone can view documents" on storage.objects for select using (bucket_id = 'documents');
