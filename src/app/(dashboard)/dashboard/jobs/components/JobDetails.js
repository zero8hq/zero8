"use client";

import React from "react";
import { format } from "date-fns";

export default function JobDetails({ job, onClose }) {
  // Function to format date with fallback
  const formatDate = (dateString, fallback = "—") => {
    if (!dateString) return fallback;
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return fallback;
    }
  };

  // Function to format date with time
  const formatDateTime = (dateString, fallback = "—") => {
    if (!dateString) return fallback;
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (e) {
      return fallback;
    }
  };

  // Get badge styling based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "paused":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "inactive":
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };
  
  // Format frequency for display
  const formatFrequency = () => {
    if (job.freq === "daily") {
      return "Daily";
    }
    
    if (job.freq === "recurring") {
      if (job.rule_type === "minutes") {
        return `Every ${job.rule_value} minute${job.rule_value === 1 ? "" : "s"}`;
      }
      if (job.rule_type === "hours") {
        return `Every ${job.rule_value} hour${job.rule_value === 1 ? "" : "s"}`;
      }
      return "Recurring";
    }
    
    if (job.freq === "custom") {
      const parts = [];
      if (job.rule_type === "weekly") {
        const days = job.rule_value?.map(day => 
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(", ");
        parts.push(`Weekly (${days})`);
      }
      if (job.rule_type === "monthly") {
        const ordinals = job.rule_value?.map(day => {
          const suffix = ["st", "nd", "rd"][((day + 90) % 100 - 10) % 10 - 1] || "th";
          return `${day}${suffix}`;
        }).join(", ");
        parts.push(`Monthly (${ordinals})`);
      }
      if (job.rule_type === "interval") {
        parts.push(`Every ${job.rule_value} day${job.rule_value === 1 ? "" : "s"}`);
      }
      return parts.join(" ");
    }
    
    return job.freq || "Unknown";
  };
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#333333]/50 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Job Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Job ID and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Job ID</p>
            <p className="text-md font-mono text-white">{job.id}</p>
          </div>
          <div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-md border ${getStatusBadgeClass(job.status)}`}>
              {job.status}
            </span>
          </div>
        </div>
        
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Frequency</p>
            <p className="text-md text-white">{formatFrequency()}</p>
          </div>
          
          {job.rule_type && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Rule Type</p>
              <p className="text-md text-white capitalize">{job.rule_type}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-400 mb-1">Start Date</p>
            <p className="text-md text-white">{formatDate(job.start_date)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-1">End Date</p>
            <p className="text-md text-white">{formatDate(job.end_date) || "—"}</p>
          </div>
          
          {job.trigger_timings && job.trigger_timings.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-400 mb-2">Trigger Times</p>
              <div className="flex flex-wrap gap-2">
                {job.trigger_timings.map((time, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded-md text-white"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {job.override_dates && job.override_dates.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-400 mb-2">Override Dates</p>
              <div className="flex flex-wrap gap-2">
                {job.override_dates.map((date, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded-md text-white"
                  >
                    {formatDate(date)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400 mb-1">Callback URL</p>
            <p className="text-md text-white break-all font-mono text-sm">{job.callback_url}</p>
          </div>
        </div>
        
        {/* Job Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#222222] border border-[#333333]/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Created</p>
            <p className="text-md text-white">{formatDateTime(job.created_at)}</p>
          </div>
          
          <div className="bg-[#222222] border border-[#333333]/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Last Triggered</p>
            <p className="text-md text-white">{formatDateTime(job.last_triggered) || "—"}</p>
          </div>
          
          <div className="bg-[#222222] border border-[#333333]/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Call Count</p>
            <p className="text-md text-white font-semibold">{job.call_count || 0}</p>
          </div>
        </div>
        
        {/* Metadata */}
        {job.metadata && Object.keys(job.metadata).length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Metadata</p>
            <div className="bg-[#222222] border border-[#333333]/50 rounded-lg p-4 overflow-auto">
              <pre className="text-white text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(job.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#333333]/50 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#222222] border border-[#333333]/50 rounded text-white text-sm hover:bg-[#2a2a2a] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 