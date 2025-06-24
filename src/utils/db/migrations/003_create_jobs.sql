-- Migration for creating the jobs table

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE,
  trigger_timings TEXT[] NOT NULL,
  freq TEXT NOT NULL,
  rule_type TEXT,
  rule_value JSONB,
  override_dates DATE[],
  callback_url TEXT NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'active',
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_count INTEGER DEFAULT 0  -- Track the number of times the job is called
); 