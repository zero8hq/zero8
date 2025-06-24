import { NextResponse } from 'next/server';
import { withApiAuth } from '@/utils/apiAuth';
import { supabase } from '@/utils/supabase';

async function handleDelete(req, context) {
  const { userId } = req.auth;
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  } else if (!userId) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 400 });
  }

  // Delete the job for the specified job ID
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (data.length <= 0) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (error) {
    return NextResponse.json({ error: 'Job not found or delete failed' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
}

export const DELETE = withApiAuth(handleDelete); 