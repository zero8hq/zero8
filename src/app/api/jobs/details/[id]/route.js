import { NextResponse } from 'next/server';
import { withApiAuth } from '@/utils/apiAuth';
import { supabase } from '@/utils/supabase';

async function handleGet(req, context) {
  const { userId } = req.auth;
  const { id } = await context.params;

  // Fetch the job details for the specified job ID
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
  }

  // Structure the response data
  const responseData = {
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
  };

  return NextResponse.json({ job: responseData }, { status: 200 });
}

export const GET = withApiAuth(handleGet); 