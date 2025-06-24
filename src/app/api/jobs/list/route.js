import { NextResponse } from 'next/server';
import { withApiAuth } from '@/utils/apiAuth';
import { supabase } from '@/utils/supabase';

async function handleGet(req) {
  const { userId } = req.auth;

  // Fetch jobs for the authenticated user
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  // Structure the response data
  const responseData = jobs.map(job => ({
    id: job.id,
    start_date: job.start_date,
    end_date: job.end_date,
    trigger_timings: job.trigger_timings,
    freq: job.freq,
    rule_type: job.rule_type,
    rule_value: job.rule_value,
    override_dates: job.override_dates,
    callback_url: job.callback_url,
    metadata: job.metadata,
    status: job.status,
    last_triggered: job.last_triggered,
    created_at: job.created_at,
    call_count: job.call_count
  }));

  return NextResponse.json({ jobs: responseData }, { status: 200 });
}

export const GET = withApiAuth(handleGet); 