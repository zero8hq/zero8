import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { headers } from 'next/headers';

// Function to check if a job should be triggered based on its frequency and current time
function shouldTriggerJob(job, currentDateObj) {
  // Format current time as HH:MM for comparison
  const currentHours = currentDateObj.getUTCHours().toString().padStart(2, '0');
  const currentMinutes = currentDateObj.getUTCMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  
  // Current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeekIndex = currentDateObj.getUTCDay();
  // Convert to the format used in our system (mon, tue, wed, etc.)
  const dayOfWeekMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayOfWeek = dayOfWeekMap[dayOfWeekIndex];
  
  // Current day of month (1-31)
  const currentDayOfMonth = currentDateObj.getUTCDate();
  
  // Current date in ISO format (YYYY-MM-DD)
  const currentDateIso = currentDateObj.toISOString().split('T')[0];
  
  // Check job frequency
  if (job.freq === 'daily') {
    // Daily jobs trigger if current time is in trigger_timings
    return job.trigger_timings && job.trigger_timings.includes(currentTime);
  } 
  else if (job.freq === 'recurring') {
    // For recurring jobs, we check if enough time has passed since last trigger
    const interval = parseInt(job.rule_value) || 0;
    
    if (interval <= 0) {
      return false; // Invalid interval
    }
    
    // Get last trigger time or use job start time if never triggered
    const lastTriggered = job.last_triggered ? new Date(job.last_triggered) : new Date(job.start_date);
    
    // Calculate the time difference
    const diff = currentDateObj - lastTriggered; // Difference in milliseconds
    
    // Convert the difference to the appropriate unit based on rule_type
    if (job.rule_type === 'minutes') {
      const diffMinutes = Math.floor(diff / (1000 * 60));
      return diffMinutes >= interval;
    } else if (job.rule_type === 'hours') {
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      return diffHours >= interval;
    }
    
    return false;
  } 
  else if (job.freq === 'custom') {
    // First, check if current time is in trigger_timings
    if (!job.trigger_timings || !job.trigger_timings.includes(currentTime)) {
      return false;
    }
    
    // Check if today is an override date
    if (job.override_dates && job.override_dates.includes(currentDateIso)) {
      return true;
    }
    
    // Check based on rule_type
    if (job.rule_type === 'weekly') {
      // Check if current day of week is in rule_value array
      return job.rule_value && Array.isArray(job.rule_value) && job.rule_value.includes(currentDayOfWeek);
    } 
    else if (job.rule_type === 'monthly') {
      // Check if current day of month is in rule_value array
      return job.rule_value && Array.isArray(job.rule_value) && job.rule_value.includes(currentDayOfMonth);
    } 
    else if (job.rule_type === 'interval') {
      // Check if days since start date is a multiple of interval
      const startDate = new Date(job.start_date);
      const diffTime = Math.abs(currentDateObj - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const interval = parseInt(job.rule_value) || 0;
      
      return interval > 0 && diffDays % interval === 0;
    }
  }
  
  return false;
}

// Function to trigger a job by calling its callback URL
async function triggerJob(job, currentTime) {
  try {
    // Prepare payload to send to callback URL
    const payload = {
      metadata: job.metadata || {},
      job_id: job.id,
      triggered_at: currentTime.toISOString()
    };
    
    // Send POST request to callback URL
    const response = await fetch(job.callback_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Update job's last_triggered timestamp and call_count
    const { error } = await supabase
      .from('jobs')
      .update({
        last_triggered: currentTime.toISOString(),
        call_count: (job.call_count || 0) + 1
      })
      .eq('id', job.id);
    
    if (error) {
      console.error(`Failed to update job ${job.id} after triggering:`, error);
    }
    
    return {
      success: response.ok,
      status: response.status,
      job_id: job.id
    };
  } catch (error) {
    console.error(`Error triggering job ${job.id}:`, error);
    return {
      success: false,
      error: error.message,
      job_id: job.id
    };
  }
}

// Authenticate the request using a GitHub Actions secret token
function isAuthenticated(req) {
  const headersList = headers();
  const authToken = headersList.get('x-auth-token');
  
  // Compare with environment variable set in your GitHub Actions workflow
  return authToken === process.env.GITHUB_ACTION_SECRET;
}

export async function GET(req) {
  // Check authentication
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get current UTC date and time
    const currentTime = new Date();
    
    // Format current date for SQL query
    const currentDate = currentTime.toISOString().split('T')[0];
    
    // Fetch active jobs where start_date <= today AND (end_date is null OR today <= end_date)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', currentDate)
      .or(`end_date.is.null,end_date.gte.${currentDate}`);
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
    
    // Process jobs in parallel
    const results = await Promise.all(
      jobs.map(async (job) => {
        if (shouldTriggerJob(job, currentTime)) {
          return await triggerJob(job, currentTime);
        } else {
          return null; // Job not triggered
        }
      })
    );
    
    // Filter out null results (jobs that weren't triggered)
    const triggeredJobs = results.filter(result => result !== null);
    
    return NextResponse.json({ 
      message: 'Job processing completed', 
      triggered_count: triggeredJobs.length,
      triggered_jobs: triggeredJobs 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 