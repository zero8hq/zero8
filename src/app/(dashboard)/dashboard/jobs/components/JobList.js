"use client";

import React from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function JobList({ 
  jobs, 
  onEdit, 
  onDelete, 
  onView,
  currentPage,
  totalPages,
  onPageChange 
}) {
  // Function to format date with fallback
  const formatDate = (dateString, fallback = "—") => {
    if (!dateString) return fallback;
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return fallback;
    }
  };
  
  // Function to format time with fallback
  const formatTime = (dateString, fallback = "—") => {
    if (!dateString) return fallback;
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (e) {
      return fallback;
    }
  };
  
  // Function to format datetime with fallback
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
  
  // Display frequency in a human-readable format
  const getFrequencyDisplay = (job) => {
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
      if (job.override_dates?.length) {
        parts.push(`+${job.override_dates.length} override${job.override_dates.length === 1 ? "" : "s"}`);
      }
      return parts.join(" ");
    }
    
    return job.freq || "Unknown";
  };
  
  // Display trigger times
  const getTriggerTimesDisplay = (job) => {
    if (!job.trigger_timings?.length) return "—";
    
    if (job.trigger_timings.length <= 2) {
      return job.trigger_timings.join(", ");
    }
    
    return `${job.trigger_timings.length} times`;
  };
  
  // Create a pagination array with ellipsis for many pages
  const getPaginationArray = () => {
    const delta = 2; // How many pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;
    
    if (totalPages <= 7) {
      // Less than 7 pages, show all
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Always include first page
      range.push(1);
      
      // Calculate start and end of range
      let start = Math.max(2, currentPage - delta);
      let end = Math.min(totalPages - 1, currentPage + delta);
      
      // Adjust if close to edges
      if (currentPage - delta > 2) {
        range.push("...");
      }
      
      // Add the pages in range
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      // Add ellipsis if needed
      if (currentPage + delta < totalPages - 1) {
        range.push("...");
      }
      
      // Always include last page
      range.push(totalPages);
    }
    
    return range;
  };

  return (
    <>
      {jobs.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#222222] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No jobs found</h3>
          <p className="text-gray-400 text-center max-w-md">
            {jobs.length === 0
              ? "You haven't created any jobs yet. Create your first job to get started."
              : "No jobs match your current filters. Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-xs text-gray-400 border-b border-[#333333]/50">
              <tr>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Frequency</th>
                <th className="px-5 py-3 text-left">Trigger</th>
                <th className="px-5 py-3 text-left">Start Date</th>
                <th className="px-5 py-3 text-left">End Date</th>
                <th className="px-5 py-3 text-left">Last Triggered</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]/50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#222222] transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white">
                      {getFrequencyDisplay(job)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {job.freq === "recurring" ? (
                      <span className="text-sm text-white">
                        {job.rule_type === "minutes" 
                          ? `Every ${job.rule_value}min` 
                          : `Every ${job.rule_value}hr`}
                      </span>
                    ) : (
                      <span className="text-sm text-white">
                        {getTriggerTimesDisplay(job)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white">
                      {formatDate(job.start_date)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white">
                      {formatDate(job.end_date)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm">
                      <div className="text-white">
                        {formatDate(job.last_triggered)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatTime(job.last_triggered)}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onView(job)}
                      className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      title="View job details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(job)}
                      className="px-2 py-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Edit job"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(job)}
                      className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                      title="Delete job"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-[#333333]/50 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]"
              }`}
            >
              First
            </button>
            
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]"
              }`}
            >
              &lt;
            </button>
            
            {getPaginationArray().map((page, index) => (
              <button
                key={`page-${page}-${index}`}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..." || page === currentPage}
                className={`px-2 py-1 text-xs rounded ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : page === "..."
                    ? "text-gray-600 cursor-default"
                    : "text-gray-400 hover:text-white hover:bg-[#333333]"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === totalPages
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]"
              }`}
            >
              &gt;
            </button>
            
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === totalPages
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]"
              }`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </>
  );
} 