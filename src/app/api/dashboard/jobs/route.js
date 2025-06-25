import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch jobs for the authenticated user
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
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
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to validate ISO date strings
function isValidISODate(dateString) {
  // If null or undefined, it's valid (for optional dates)
  if (dateString === null || dateString === undefined) {
    return true;
  }
  
  // Empty string should be handled as null
  if (dateString === '') {
    return true;
  }
  
  // Validate date string
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
  if (ruleType === 'minutes') {
    return Number.isInteger(ruleValue) && ruleValue > 0 && ruleValue <= 1440;
  }
  if (ruleType === 'hours') {
    return Number.isInteger(ruleValue) && ruleValue > 0 && ruleValue <= 24;
  }
  return false;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const requestData = await req.json();

    // Initialize an array to collect error messages
    const errors = [];

    // Check for restricted fields that cannot be set by users
    const restrictedFields = ['call_count', 'last_triggered', 'created_at', 'user_id', 'id'];
    restrictedFields.forEach(field => {
      if (field in requestData) {
        errors.push(`Field ${field} cannot be set`);
      }
    });

    // If there are any errors from restricted fields, return them immediately
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Invalid input data', details: errors }, { status: 400 });
    }

    // Destructure the requestData after checking for restricted fields
    const { start_date, end_date, trigger_timings, freq, rule_type, rule_value, override_dates, callback_url, metadata, status } = requestData;

    // Validate input data
    if (!start_date || typeof start_date !== 'string' || !isValidISODate(start_date)) {
      errors.push('Invalid or missing start_date');
    }
    
    // Handle empty string for end_date by treating it as null
    let processedEndDate = end_date;
    if (end_date === '') {
      processedEndDate = null;
    }
    else if (end_date && (typeof end_date !== 'string' || !isValidISODate(end_date))) {
      errors.push('Invalid end_date');
    }

    // Check if freq is valid
    if (!freq || typeof freq !== 'string' || !['daily', 'custom', 'recurring'].includes(freq)) {
      errors.push('Invalid or missing freq');
    }
    
    // Validate based on frequency type
    if (freq === 'recurring') {
      // For recurring frequency:
      // 1. trigger_timings should NOT be provided
      // 2. override_dates should NOT be provided
      if (trigger_timings) {
        errors.push('trigger_timings should not be provided for recurring frequency');
      }
      
      if (override_dates) {
        errors.push('override_dates should not be provided for recurring frequency');
      }
      
      // Validate rule_type and rule_value
      if (!rule_type || !['minutes', 'hours'].includes(rule_type)) {
        errors.push('For recurring frequency, rule_type must be \'minutes\' or \'hours\'');
      }
      
      if (!rule_value) {
        if (rule_type) {
          errors.push(`Invalid rule_value for ${rule_type}`);
        } else {
          errors.push('rule_value is required for recurring frequency');
        }
      } else if (rule_type && !isValidRuleValue(rule_type, rule_value)) {
        errors.push(`Invalid rule_value for ${rule_type}`);
      }
    } else {
      // For daily and custom frequencies, trigger_timings is mandatory
      if (!Array.isArray(trigger_timings) || !trigger_timings.length || !trigger_timings.every(time => typeof time === 'string' && isValidTimeString(time))) {
        errors.push('trigger_timings is required');
      }
      
      // Daily frequency should not have rules or override dates
      if (freq === 'daily') {
        if (rule_type || rule_value || override_dates) {
          errors.push('For daily frequency, rule_type, rule_value, and override_dates must not be provided');
        }
      }
      // Custom frequency validation
      else if (freq === 'custom') {
        // If rule_type is provided, validate it and rule_value
        if (rule_type) {
          if (!['weekly', 'monthly', 'interval'].includes(rule_type) || !isValidRuleValue(rule_type, rule_value)) {
            errors.push('Invalid rule_type or rule_value for custom frequency');
          }
        }
        
        // Validate override_dates if provided
        if (override_dates && (!Array.isArray(override_dates) || !override_dates.every(date => typeof date === 'string' && isValidISODate(date)))) {
          errors.push('Invalid override_dates');
        }
        
        // For custom frequency, either rule_type or override_dates must be provided
        if (!rule_type && (!override_dates || override_dates.length === 0)) {
          errors.push('For custom frequency, provide either rule_type/rule_value or override_dates');
        }
        
        // If rule_type is provided, rule_value must also be provided (and vice versa)
        if ((rule_type && !rule_value) || (!rule_type && rule_value)) {
          errors.push('Both rule_type and rule_value must be provided together');
        }
      }
    }
    
    if (!callback_url || typeof callback_url !== 'string' || !isValidURL(callback_url)) {
      errors.push('Invalid or missing callback_url');
    }
    if (metadata && typeof metadata !== 'object') {
      errors.push('Invalid metadata');
    }

    // If there are any errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Invalid input data', details: errors }, { status: 400 });
    }

    // Insert job into the database
    const { data, error } = await supabase.from('jobs').insert({
      user_id: userId,
      start_date,
      end_date: processedEndDate,
      trigger_timings: freq === 'recurring' ? null : trigger_timings,
      freq,
      rule_type: freq === 'daily' ? null : rule_type,
      rule_value: freq === 'daily' ? null : rule_value,
      override_dates: (freq === 'daily' || freq === 'recurring') ? null : override_dates,
      callback_url,
      metadata,
      status: status || 'active'
    }).select().single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job created successfully', job: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 