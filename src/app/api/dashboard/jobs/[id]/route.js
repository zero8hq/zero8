import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { supabase } from '@/utils/supabase';

// Helper function to validate ISO date strings
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
}

// Helper function to validate URLs
function isValidURL(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to validate time strings in HH:mm format
function isValidTimeString(timeString) {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timePattern.test(timeString);
}

// Helper function to validate rule_value based on rule_type
function isValidRuleValue(ruleType, ruleValue) {
  if (ruleType === 'weekly') {
    return Array.isArray(ruleValue) && ruleValue.every(day => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(day));
  }
  if (ruleType === 'monthly') {
    return Array.isArray(ruleValue) && ruleValue.every(day => Number.isInteger(day) && day >= 1 && day <= 31);
  }
  if (ruleType === 'interval') {
    return Number.isInteger(ruleValue) && ruleValue > 0;
  }
  return false;
}

// GET - Get specific job details
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch the specific job for the authenticated user
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
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
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update job
export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await context.params;
    
    let updates;
    try {
      updates = await req.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    // Initialize an array to collect error messages
    const errors = [];

    // Check for restricted fields that cannot be updated by users
    const restrictedFields = ['call_count', 'last_triggered', 'created_at', 'user_id', 'id'];
    restrictedFields.forEach(field => {
      if (field in updates) {
        errors.push(`Field ${field} cannot be updated`);
      }
    });

    // If there are any errors from restricted fields, return them immediately
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Invalid input data', details: errors }, { status: 400 });
    }

    // Validate input data
    if (updates.start_date && (typeof updates.start_date !== 'string' || !isValidISODate(updates.start_date))) {
      errors.push('Invalid start_date');
    }
    if (updates.end_date && (typeof updates.end_date !== 'string' || !isValidISODate(updates.end_date))) {
      errors.push('Invalid end_date');
    }
    if (updates.trigger_timings && (!Array.isArray(updates.trigger_timings) || !updates.trigger_timings.every(time => typeof time === 'string' && isValidTimeString(time)))) {
      errors.push('Invalid trigger_timings');
    }
    if (updates.freq && (typeof updates.freq !== 'string' || !['daily', 'custom'].includes(updates.freq))) {
      errors.push('Invalid freq');
    }
    if (updates.freq === 'daily') {
      if (updates.rule_type || updates.rule_value || updates.override_dates) {
        errors.push('For daily frequency, rule_type, rule_value, and override_dates must not be provided');
      }
    }
    if (updates.rule_type && (typeof updates.rule_type !== 'string' || !['weekly', 'monthly', 'interval'].includes(updates.rule_type) || !isValidRuleValue(updates.rule_type, updates.rule_value))) {
      errors.push('Invalid rule_type or rule_value');
    }
    if (updates.override_dates && (!Array.isArray(updates.override_dates) || !updates.override_dates.every(date => typeof date === 'string' && isValidISODate(date)))) {
      errors.push('Invalid override_dates');
    }
    if (updates.callback_url && (typeof updates.callback_url !== 'string' || !isValidURL(updates.callback_url))) {
      errors.push('Invalid callback_url');
    }
    if (updates.metadata && typeof updates.metadata !== 'object') {
      errors.push('Invalid metadata');
    }

    // Rule validation will be handled in the frequency-specific logic below

    // If there are any errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Invalid input data', details: errors }, { status: 400 });
    }

    // Handle freq change logic
    if (updates.freq === 'daily') {
      updates.rule_type = null;
      updates.rule_value = null;
      updates.override_dates = null;
    } else if (updates.freq === 'custom') {
      const hasRule = updates.rule_type && updates.rule_value;
      const hasOverrideDates = updates.override_dates && updates.override_dates.length > 0;

      if (!hasRule && !hasOverrideDates) {
        return NextResponse.json({ error: 'For custom frequency, either rule_type and rule_value must be provided, or override_dates must be provided' }, { status: 400 });
      }

      // Set fields to null based on what is provided
      if (hasRule && !hasOverrideDates) {
        updates.override_dates = null;
      } else if (hasOverrideDates && !hasRule) {
        updates.rule_type = null;
        updates.rule_value = null;
      }
    }

    // Update the job details for the specified job ID
    const { data: job, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !job) {
      if (error && error.code === '23502') {
        return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Job not found or update failed' }, { status: 404 });
      }
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
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete job
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Delete the job for the specified job ID
    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (data && data.length <= 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 