import { NextResponse } from "next/server";
import { withApiAuth } from "@/utils/apiAuth";
import { supabase } from "@/utils/supabase";

// Helper function to validate ISO date strings
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && dateString === date.toISOString().split("T")[0]
  );
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
  if (ruleType === "weekly") {
    return (
      Array.isArray(ruleValue) &&
      ruleValue.every((day) =>
        ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].includes(day)
      )
    );
  }
  if (ruleType === "monthly") {
    return (
      Array.isArray(ruleValue) &&
      ruleValue.every((day) => Number.isInteger(day) && day >= 1 && day <= 31)
    );
  }
  if (ruleType === "interval") {
    return Number.isInteger(ruleValue) && ruleValue > 0;
  }
  if (ruleType === "minutes") {
    return Number.isInteger(ruleValue) && ruleValue > 0 && ruleValue <= 1440;
  }
  if (ruleType === "hours") {
    return Number.isInteger(ruleValue) && ruleValue > 0 && ruleValue <= 24;
  }
  return false;
}

async function handlePost(req) {
  const { userId } = req.auth;
  const {
    start_date,
    end_date,
    trigger_timings,
    freq,
    rule_type,
    rule_value,
    override_dates,
    callback_url,
    metadata,
    status,
  } = await req.json();

  // Initialize an array to collect error messages
  const errors = [];

  // Validate input data
  if (
    !start_date ||
    typeof start_date !== "string" ||
    !isValidISODate(start_date)
  ) {
    errors.push("Invalid or missing start_date");
  }
  if (end_date && (typeof end_date !== "string" || !isValidISODate(end_date))) {
    errors.push("Invalid end_date");
  }
  
  // Check if freq is valid
  if (
    !freq ||
    typeof freq !== "string" ||
    !["daily", "custom", "recurring"].includes(freq)
  ) {
    errors.push("Invalid or missing freq");
  }
  
  // Validate based on frequency type
  if (freq === "recurring") {
    // For recurring frequency:
    // 1. trigger_timings should NOT be provided
    // 2. override_dates should NOT be provided
    if (trigger_timings) {
      errors.push("trigger_timings should not be provided for recurring frequency");
    }
    
    if (override_dates) {
      errors.push("override_dates should not be provided for recurring frequency");
    }
    
    // Validate rule_type and rule_value
    if (!rule_type || !["minutes", "hours"].includes(rule_type)) {
      errors.push("For recurring frequency, rule_type must be 'minutes' or 'hours'");
    }
    
    if (!rule_value || !isValidRuleValue(rule_type, rule_value)) {
      if (rule_type) {
        errors.push(`Invalid rule_value for ${rule_type}`);
      } else {
        errors.push("rule_value is required for recurring frequency");
      }
    }
  } else {
    // For daily and custom frequencies, trigger_timings is mandatory
    if (
      !Array.isArray(trigger_timings) ||
      !trigger_timings.length ||
      !trigger_timings.every(
        (time) => typeof time === "string" && isValidTimeString(time)
      )
    ) {
      errors.push("trigger_timings is required");
    }
    
    // Daily frequency should not have rules or override dates
    if (freq === "daily") {
      if (rule_type || rule_value || override_dates) {
        errors.push(
          "For daily frequency, rule_type, rule_value, and override_dates must not be provided"
        );
      }
    } 
    // Custom frequency can have rules and/or override_dates
    else if (freq === "custom") {
      // If rule_type is provided, validate it and rule_value
      if (rule_type) {
        if (!["weekly", "monthly", "interval"].includes(rule_type) || 
            !isValidRuleValue(rule_type, rule_value)) {
          errors.push("Invalid rule_type or rule_value for custom frequency");
        }
      }
      
      // Validate override_dates if provided
      if (override_dates && 
          (!Array.isArray(override_dates) ||
           !override_dates.every(date => typeof date === "string" && isValidISODate(date))
          )
      ) {
        errors.push("Invalid override_dates");
      }
      
      // For custom frequency, either rule_type or override_dates must be provided
      if (!rule_type && !override_dates) {
        errors.push("For custom frequency, either rule_type or override_dates must be provided");
      }
    }
  }
  
  if (
    !callback_url ||
    typeof callback_url !== "string" ||
    !isValidURL(callback_url)
  ) {
    errors.push("Invalid or missing callback_url");
  }
  
  if (metadata && typeof metadata !== "object") {
    errors.push("Invalid metadata");
  }

  if (
    status &&
    (typeof status !== "string" || !["active", "inactive"].includes(status))
  ) {
    errors.push("Invalid status");
  }

  // Ensure rule_type and rule_value are both provided or both absent
  if ((rule_type && !rule_value) || (!rule_type && rule_value)) {
    errors.push("Both rule_type and rule_value must be provided together");
  }

  // If there are any errors, return them
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Invalid input data", details: errors },
      { status: 400 }
    );
  }

  // Insert job into the database
  const { data, error } = await supabase.from("jobs").insert({
    user_id: userId,
    start_date,
    end_date,
    trigger_timings,
    freq,
    rule_type,
    rule_value,
    override_dates,
    callback_url,
    metadata,
    status: status || "active",
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Job created successfully", job: data },
    { status: 201 }
  );
}

export const POST = withApiAuth(handlePost);
