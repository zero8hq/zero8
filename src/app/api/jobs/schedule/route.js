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
  if (
    !Array.isArray(trigger_timings) ||
    !trigger_timings.every(
      (time) => typeof time === "string" && isValidTimeString(time)
    )
  ) {
    errors.push("Invalid trigger_timings");
  }
  if (
    !freq ||
    typeof freq !== "string" ||
    !["daily", "custom"].includes(freq)
  ) {
    errors.push("Invalid or missing freq");
  }
  if (freq === "daily") {
    if (rule_type || rule_value || override_dates) {
      errors.push(
        "For daily frequency, rule_type, rule_value, and override_dates must not be provided"
      );
    }
  }
  if (
    rule_type &&
    (typeof rule_type !== "string" ||
      !["weekly", "monthly", "interval"].includes(rule_type) ||
      !isValidRuleValue(rule_type, rule_value))
  ) {
    errors.push("Invalid rule_type or rule_value");
  }
  if (
    override_dates &&
    (!Array.isArray(override_dates) ||
      !override_dates.every(
        (date) => typeof date === "string" && isValidISODate(date)
      ))
  ) {
    errors.push("Invalid override_dates");
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
    status,
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
