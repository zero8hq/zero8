"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [metadataText, setMetadataText] = useState('{}');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [freqFilter, setFreqFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(50); // Show 50 jobs per page
  const [totalJobs, setTotalJobs] = useState(0);
  
  const router = useRouter();

  // Form state for creating/editing jobs
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    trigger_timings: ['09:00'],
    freq: 'daily',
    rule_type: '',
    rule_value: '',
    override_dates: [],
    callback_url: '',
    metadata: {}
  });

  useEffect(() => {
    fetchJobs();
  }, []);



  // Export functionality
  const exportJobs = () => {
    const dataToExport = filteredJobs.map(job => ({
      id: job.id,
      status: job.status,
      start_date: job.start_date,
      end_date: job.end_date,
      trigger_timings: job.trigger_timings,
      freq: job.freq,
      rule_type: job.rule_type,
      rule_value: job.rule_value,
      override_dates: job.override_dates,
      callback_url: job.callback_url,
      call_count: job.call_count,
      last_triggered: job.last_triggered,
      created_at: job.created_at,
      metadata: job.metadata
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredJobs.length} jobs`);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dashboard/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      const jobsData = data.jobs || [];
      setJobs(jobsData);
      setTotalJobs(jobsData.length);
    } catch (error) {
      toast.error("Failed to load jobs");
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized filtering and sorting logic
  const processJobs = React.useMemo(() => {
    let processed = [...jobs];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      processed = processed.filter(job => 
        job.id.toLowerCase().includes(searchLower) ||
        job.callback_url.toLowerCase().includes(searchLower) ||
        (job.metadata && JSON.stringify(job.metadata).toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      processed = processed.filter(job => job.status === statusFilter);
    }

    // Apply frequency filter
    if (freqFilter !== 'all') {
      processed = processed.filter(job => job.freq === freqFilter);
    }

    // Apply sorting
    processed.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'created_at' || sortBy === 'last_triggered') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = sortOrder === 'asc' ? Number.MIN_VALUE : Number.MAX_VALUE;
      if (bValue === null || bValue === undefined) bValue = sortOrder === 'asc' ? Number.MIN_VALUE : Number.MAX_VALUE;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return processed;
  }, [jobs, debouncedSearchTerm, statusFilter, freqFilter, sortBy, sortOrder]);

  // Update filtered jobs when processing changes
  React.useEffect(() => {
    setFilteredJobs(processJobs);
    setCurrentPage(1); // Reset to first page when filters change
  }, [processJobs]);

  // Memoized pagination
  const paginatedJobs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, jobsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Debounce search term to improve performance
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const resetForm = () => {
    setFormData({
      start_date: '',
      end_date: '',
      trigger_timings: ['09:00'],
      freq: 'daily',
      rule_type: '',
      rule_value: '',
      override_dates: [],
      callback_url: '',
      metadata: {}
    });
    setFormErrors({});
    setMetadataText('{}');
    setIsFormValid(false);
  };

  // Comprehensive form validation
  const validateFormCompletely = (data, errors) => {
    const issues = [];
    
    // Required fields validation
    if (!data.start_date) issues.push('Start date is required');
    if (!data.trigger_timings || data.trigger_timings.length === 0) issues.push('At least one trigger time is required');
    if (!data.callback_url) issues.push('Callback URL is required');
    
    // URL validation
    if (data.callback_url) {
      try {
        new URL(data.callback_url);
      } catch {
        issues.push('Callback URL must be valid');
      }
    }
    
    // Custom frequency validation
    if (data.freq === 'custom') {
      const hasRuleData = data.rule_type && data.rule_value;
      const hasValidOverrideDates = data.override_dates && data.override_dates.length > 0 && data.override_dates.some(date => date.trim() !== '');
      
      if (!hasRuleData && !hasValidOverrideDates) {
        issues.push('For custom frequency, provide either rule type/value OR override dates');
      }
      
      // Rule type specific validation
      if (data.rule_type && !data.rule_value) {
        issues.push('Rule value is required when rule type is selected');
      }
      
      if (data.rule_type === 'weekly' && data.rule_value) {
        const days = data.rule_value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const invalidDays = days.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          issues.push(`Invalid day names: ${invalidDays.join(', ')}`);
        }
        if (days.length === 0) {
          issues.push('Weekly rule must have at least one day');
        }
      }
      
      if (data.rule_type === 'monthly' && data.rule_value) {
        const parts = data.rule_value.split(',').map(s => s.trim()).filter(s => s);
        const numbers = parts.map(s => parseInt(s)).filter(n => !isNaN(n));
        const invalidNumbers = numbers.filter(n => n < 1 || n > 31);
        const nonNumbers = parts.filter(s => isNaN(parseInt(s)));
        
        if (nonNumbers.length > 0) {
          issues.push(`Invalid entries in monthly rule: ${nonNumbers.join(', ')}`);
        }
        if (invalidNumbers.length > 0) {
          issues.push(`Invalid day numbers: ${invalidNumbers.join(', ')} (must be 1-31)`);
        }
        if (numbers.length === 0 && parts.length > 0) {
          issues.push('Monthly rule must have valid day numbers');
        }
      }
      
      if (data.rule_type === 'interval' && data.rule_value) {
        const num = parseInt(data.rule_value);
        if (isNaN(num) || num < 1) {
          issues.push('Interval must be a positive number');
        }
      }
    }
    
    // Check for existing form errors
    if (Object.keys(errors).length > 0) {
      issues.push('Please fix the highlighted form errors');
    }
    
    return issues;
  };

  // Update form validation whenever form data or errors change
  React.useEffect(() => {
    const validationIssues = validateFormCompletely(formData, formErrors);
    setIsFormValid(validationIssues.length === 0);
  }, [formData, formErrors]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Special handling for frequency changes
    if (field === 'freq') {
      // Clear rule-related errors when changing frequency
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rule_value;
        delete newErrors.rule_type;
        return newErrors;
      });
      
      // Clear rule data when switching to daily
      if (value === 'daily') {
        setFormData(prev => ({
          ...prev,
          freq: value,
          rule_type: '',
          rule_value: ''
        }));
        return; // Exit early since we already updated formData
      }
    }

    // Clear rule_value error when changing rule_type
    if (field === 'rule_type') {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rule_value;
        return newErrors;
      });
    }

    // Real-time validation for specific fields
    if (field === 'callback_url' && value) {
      try {
        new URL(value);
      } catch {
        setFormErrors(prev => ({
          ...prev,
          callback_url: 'Please enter a valid URL'
        }));
      }
    }

    if (field === 'rule_value' && formData.rule_type && value) {
      if (formData.rule_type === 'weekly') {
        const days = value.split(',').map(s => s.trim().toLowerCase());
        const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const invalidDays = days.filter(day => day && !validDays.includes(day));
        if (invalidDays.length > 0) {
          setFormErrors(prev => ({
            ...prev,
            rule_value: `Invalid day names: ${invalidDays.join(', ')}`
          }));
        }
      } else if (formData.rule_type === 'monthly') {
        const parts = value.split(',').map(s => s.trim()).filter(s => s);
        const numbers = parts.map(s => parseInt(s)).filter(n => !isNaN(n));
        const invalidNumbers = numbers.filter(n => n < 1 || n > 31);
        const nonNumbers = parts.filter(s => isNaN(parseInt(s)));
        
        if (nonNumbers.length > 0) {
          setFormErrors(prev => ({
            ...prev,
            rule_value: `Invalid entries: "${nonNumbers.join('", "')}" - only numbers 1-31 allowed`
          }));
        } else if (invalidNumbers.length > 0) {
          setFormErrors(prev => ({
            ...prev,
            rule_value: `Invalid day numbers: ${invalidNumbers.join(', ')} (must be 1-31)`
          }));
        } else if (numbers.length === 0 && parts.length > 0) {
          setFormErrors(prev => ({
            ...prev,
            rule_value: 'Please enter valid day numbers (1-31)'
          }));
        }
      } else if (formData.rule_type === 'interval') {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          setFormErrors(prev => ({
            ...prev,
            rule_value: 'Interval must be a positive number'
          }));
        }
      }
    }
  };

  const handleTriggerTimingChange = (index, value) => {
    const newTimings = [...formData.trigger_timings];
    newTimings[index] = value;
    setFormData(prev => ({
      ...prev,
      trigger_timings: newTimings
    }));
  };

  const addTriggerTiming = () => {
    setFormData(prev => ({
      ...prev,
      trigger_timings: [...prev.trigger_timings, '09:00']
    }));
  };

  const removeTriggerTiming = (index) => {
    if (formData.trigger_timings.length > 1) {
      const newTimings = formData.trigger_timings.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        trigger_timings: newTimings
      }));
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    
    // Prevent submission if form is invalid
    if (!isFormValid) {
      const validationIssues = validateFormCompletely(formData, formErrors);
      toast.error(validationIssues[0] || 'Please complete all required fields');
      return;
    }

    setIsCreating(true);

    try {

      // Process and clean the data
      const jobData = processJobData(formData);
      
      if (Object.keys(jobData).length === 0) {
        toast.error('No valid data to create job');
        setIsCreating(false);
        return;
      }

      const response = await fetch("/api/dashboard/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          toast.error(errorData.details.join(', '));
        } else {
          toast.error(errorData.error || "Failed to create job");
        }
        setIsCreating(false);
        return;
      }

      // Only close form and reset on success
      toast.success("Job created successfully!");
      resetForm();
      setShowCreateForm(false);
      fetchJobs();
    } catch (error) {
      toast.error(error.message || "Failed to create job");
      console.error("Error creating job:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const validateJobData = (data) => {
    const errors = [];
    
    if (!data.start_date) {
      errors.push('Start date is required');
    }
    
    if (!data.trigger_timings || data.trigger_timings.length === 0) {
      errors.push('At least one trigger time is required');
    }
    
    if (!data.callback_url) {
      errors.push('Callback URL is required');
    }
    
    if (data.freq === 'custom') {
      const hasRuleData = data.rule_type && data.rule_value;
      const hasOverrideDates = data.override_dates && data.override_dates.length > 0;
      
      if (!hasRuleData && !hasOverrideDates) {
        errors.push('For custom frequency, provide either rule type/value OR override dates');
      }
    }
    
    return errors;
  };

  const processJobData = (data) => {
    const processedData = { ...data };
    
    // Handle frequency-specific logic
    if (processedData.freq === 'daily') {
      processedData.rule_type = null;
      processedData.rule_value = null;
      processedData.override_dates = null;
    } else if (processedData.freq === 'custom' && processedData.rule_type && processedData.rule_value) {
      if (processedData.rule_type === 'weekly') {
        // Ensure it's an array of valid day names
        if (typeof processedData.rule_value === 'string') {
          processedData.rule_value = processedData.rule_value
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(day => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(day));
        }
      } else if (processedData.rule_type === 'monthly') {
        // Ensure it's an array of valid day numbers
        if (typeof processedData.rule_value === 'string') {
          processedData.rule_value = processedData.rule_value
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= 31);
        }
      } else if (processedData.rule_type === 'interval') {
        // Ensure it's a positive integer
        processedData.rule_value = parseInt(processedData.rule_value);
        if (isNaN(processedData.rule_value) || processedData.rule_value <= 0) {
          throw new Error('Interval must be a positive number');
        }
      }
    }

    // Clean up empty fields but keep important nulls
    const cleanedData = {};
    Object.keys(processedData).forEach(key => {
      const value = processedData[key];
      if (value !== '' && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
        cleanedData[key] = value;
      }
    });

    return cleanedData;
  };

  const updateJob = async (jobId) => {
    // Prevent submission if form is invalid
    if (!isFormValid) {
      const validationIssues = validateFormCompletely(formData, formErrors);
      toast.error(validationIssues[0] || 'Please complete all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      // Process and clean the data
      const jobData = processJobData(formData);
      
      if (Object.keys(jobData).length === 0) {
        toast.error('No valid data to update');
        setIsUpdating(false);
        return;
      }

      const response = await fetch(`/api/dashboard/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          toast.error(errorData.details.join(', '));
        } else {
          toast.error(errorData.error || "Failed to update job");
        }
        setIsUpdating(false);
        return;
      }

      // Get the updated job data - the API returns { job: {...} }
      const responseData = await response.json();
      const updatedJob = responseData.job;
      
      if (updatedJob) {
        // Update the job in the local state without reloading
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId ? updatedJob : job
        ));
      } else {
        // Fallback to fetching all jobs if the response structure is unexpected
        console.warn('Unexpected response structure from update API:', responseData);
        fetchJobs();
      }

      // Only close form and reset on success
      toast.success("Job updated successfully!");
      setEditingJob(null);
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to update job");
      console.error("Error updating job:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!jobId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job");
      }

      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success("Job deleted successfully");
      setJobToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete job");
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (job) => {
    const metadata = job.metadata || {};
    setFormData({
      start_date: job.start_date || '',
      end_date: job.end_date || '',
      trigger_timings: job.trigger_timings || ['09:00'],
      freq: job.freq || 'daily',
      rule_type: job.rule_type || '',
      rule_value: Array.isArray(job.rule_value) ? job.rule_value.join(', ') : (job.rule_value || ''),
      override_dates: job.override_dates || [],
      callback_url: job.callback_url || '',
      metadata: metadata
    });
    setMetadataText(JSON.stringify(metadata, null, 2));
    setEditingJob(job);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'inactive': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getFreqDisplay = (job) => {
    if (job.freq === 'daily') return 'Daily';
    if (job.freq === 'custom') {
      const parts = [];
      if (job.rule_type === 'weekly') parts.push(`Weekly (${job.rule_value?.join(', ')})`);
      if (job.rule_type === 'monthly') parts.push(`Monthly (${job.rule_value?.join(', ')})`);
      if (job.rule_type === 'interval') parts.push(`Every ${job.rule_value} days`);
      if (job.override_dates && job.override_dates.length > 0) {
        parts.push(`Override dates: ${job.override_dates.length}`);
      }
      return parts.length > 0 ? parts.join(' + ') : 'Custom';
    }
    return job.freq;
  };

  // Memoized job row component for better performance
  const JobRow = React.memo(({ job, onView, onEdit, onDelete }) => (
    <div className="mb-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="grid grid-cols-12 h-full">      
        {/* Main Content */}
        <div className="col-span-12 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex-1 min-w-0">
              {/* URL and ID */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <h3 className="text-white font-medium text-base truncate max-w-md">
                  {job.callback_url}
                </h3>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 font-mono bg-[#222222] px-2 py-1 rounded border border-[#333333]">
                    {job.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
              
              {/* Job Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center">
                    <svg className={`w-4 h-4 ${
                      job.status === 'active' ? 'text-green-500' : 
                      job.status === 'paused' ? 'text-amber-500' : 'text-red-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={job.status === 'active' 
                          ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                          : job.status === 'paused'
                          ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} 
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`text-sm font-medium ${
                      job.status === 'active' ? 'text-green-500' : 
                      job.status === 'paused' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </p>
                  </div>
                </div>
                
                {/* Frequency */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Frequency</p>
                    <p className="text-sm font-medium text-white">{getFreqDisplay(job)}</p>
                  </div>
                </div>
                
                {/* Times */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Times</p>
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                      {job.trigger_timings?.join(', ')}
                    </p>
                  </div>
                </div>
                
                {/* Calls */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Calls</p>
                    <p className="text-sm font-medium text-white">{job.call_count || 0}</p>
                  </div>
                </div>
              </div>
              
              {/* Dates */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                
                {job.last_triggered && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last triggered: {new Date(job.last_triggered).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {job.start_date}</span>
                </div>
                
                {job.end_date && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>End: {job.end_date}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-row md:flex-col justify-end gap-2">
              <button
                onClick={() => onView(job)}
                className="px-4 py-2 text-sm bg-[#222222] text-gray-300 rounded-md hover:bg-[#2a2a2a] hover:text-white transition-all duration-200 border border-[#333333] flex items-center justify-center gap-2 w-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(job)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600/10 text-blue-500 rounded-md hover:bg-blue-600/20 transition-all duration-200 border border-blue-500/20 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(job.id)}
                  className="flex-1 px-4 py-2 text-sm bg-red-600/10 text-red-500 rounded-md hover:bg-red-600/20 transition-all duration-200 border border-red-500/20 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
  
  // Add display name to fix ESLint error
  JobRow.displayName = 'JobRow';
  
  const renderJobForm = (isEdit = false) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg max-w-4xl w-full max-h-[100vh] overflow-hidden border border-[#333333] relative">
        <div className="relative">
          {/* Header */}
          <div className="px-10 py-6 border-b border-[#333333] bg-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
                  <svg className="w-10 h-4 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="md:text-2xl text-md font-bold text-white">
                    {isEdit ? 'Edit Job' : 'Create New Job'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {isEdit ? 'Modify your scheduled job configuration' : 'Set up a new scheduled job for automation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isEdit) {
                    setEditingJob(null);
                  } else {
                    setShowCreateForm(false);
                  }
                  resetForm();
                }}
                className="md:w-9 md:h-9 w-14 h-9 bg-[#1a1a1a] hover:bg-[#333333] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 border border-[#333333]"
              >
                <svg className="md:w-5 md:h-5 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-h-[calc(95vh-250px)] md:max-h-[calc(95vh-200px)] overflow-y-auto">
            <form 
              id="job-form" 
              onSubmit={(e) => {
                e.preventDefault();
                if (isEdit) {
                  updateJob(editingJob.id);
                } else {
                  createJob(e);
                }
              }} 
              className="p-10 space-y-8 flex flex-col gap-3">
              
              {/* Schedule Configuration Section */}
              <div className="bg-[#222222] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-4 md:w-4 md:h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Schedule Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                      <span className="text-red-400 mr-1">*</span>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                      End Date
                      <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger Times Section */}
              <div className="bg-[#222222] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Trigger Times</h3>
                  <span className="text-red-400 text-sm ml-1">*</span>
                </div>

                <div className="space-y-4">
                  {formData.trigger_timings.map((timing, index) => (
                    <div key={index} className="flex items-center gap-4 mb-1">
                      <div className="flex-1">
                        <input
                          type="time"
                          value={timing}
                          onChange={(e) => handleTriggerTimingChange(index, e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        />
                      </div>
                      {formData.trigger_timings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTriggerTiming(index)}
                          className="w-10 h-10 bg-[#333333] text-red-400 border border-[#444444] rounded-lg hover:bg-[#3a3a3a] transition-all duration-200 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addTriggerTiming}
                    className="w-full py-3 bg-[#333333] border border-[#444444] text-blue-400 rounded-lg hover:bg-[#3a3a3a] transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Time
                  </button>
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="bg-[#222222] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Frequency</h3>
                  <span className="text-red-400 text-sm ml-1">*</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.freq === 'daily' 
                        ? 'border-blue-600 bg-blue-600/10' 
                        : 'border-[#333333] hover:border-[#444444]'
                    }`}
                    onClick={() => handleInputChange('freq', 'daily')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ml-1 ${
                        formData.freq === 'daily' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-400'
                      }`}></div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Daily</h4>
                        <p className="text-gray-400 text-sm">Runs every day at specified times</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.freq === 'custom' 
                        ? 'border-blue-600 bg-blue-600/10' 
                        : 'border-[#333333] hover:border-[#444444]'
                    }`}
                    onClick={() => handleInputChange('freq', 'custom')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ml-1 ${
                        formData.freq === 'custom' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-400'
                      }`}></div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Custom</h4>
                        <p className="text-gray-400 text-sm">Advanced scheduling options</p>
                      </div>
                    </div>
                  </div>
                </div>

                <input type="hidden" name="freq" value={formData.freq} required />
              </div>

              {/* Custom Frequency Options */}
              {formData.freq === 'custom' && (
                <div className="bg-[#222222] p-6 rounded-lg border border-[#333333]">
                  <h3 className="text-sm font-medium text-gray-300 mb-1 ">
                    Custom Frequency Configuration
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">
                    Provide either rule type/value OR override dates (or both)
                  </p>

                  {/* Rule Type and Value Section */}
                  <div className="space-y-5 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Rule Type (Optional)
                      </label>
                      <select
                        value={formData.rule_type}
                        onChange={(e) => handleInputChange('rule_type', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select rule type (or leave empty)</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="interval">Interval (days)</option>
                      </select>
                    </div>

                    {formData.rule_type && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 mt-3">
                          Rule Value
                        </label>
                        {formData.rule_type === 'weekly' && (
                          <div>
                            <input
                              type="text"
                              value={formData.rule_value}
                              onChange={(e) => handleInputChange('rule_value', e.target.value)}
                              placeholder="e.g., mon, wed, fri"
                              className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none focus:ring-1 focus:border-blue-500 ${
                                formErrors.rule_value 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-[#333333] focus:ring-blue-500'
                              }`}
                            />
                            {formErrors.rule_value ? (
                              <p className="text-red-400 text-xs mt-2">{formErrors.rule_value}</p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-2">
                                Enter day names separated by commas: mon, tue, wed, thu, fri, sat, sun
                              </p>
                            )}
                          </div>
                        )}
                        {formData.rule_type === 'monthly' && (
                          <div>
                            <input
                              type="text"
                              value={formData.rule_value}
                              onChange={(e) => handleInputChange('rule_value', e.target.value)}
                              placeholder="e.g., 1, 15, 30"
                              className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none focus:ring-1 focus:border-blue-500 ${
                                formErrors.rule_value 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-[#333333] focus:ring-blue-500'
                              }`}
                            />
                            {formErrors.rule_value ? (
                              <p className="text-red-400 text-xs mt-2">{formErrors.rule_value}</p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-2">
                                Enter day numbers (1-31) separated by commas: 1, 15, 30
                              </p>
                            )}
                          </div>
                        )}
                        {formData.rule_type === 'interval' && (
                          <div>
                            <input
                              type="number"
                              value={formData.rule_value}
                              onChange={(e) => handleInputChange('rule_value', e.target.value)}
                              placeholder="Number of days"
                              min="1"
                              className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none focus:ring-1 focus:border-blue-500 ${
                                formErrors.rule_value 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-[#333333] focus:ring-blue-500'
                              }`}
                            />
                            {formErrors.rule_value ? (
                              <p className="text-red-400 text-xs mt-2">{formErrors.rule_value}</p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1">
                                Enter the number of days between job executions (minimum: 1)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Override Dates Section */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Override Dates (Optional)
                      </label>
                      <div className="space-y-3">
                        {formData.override_dates.map((date, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => {
                                const newDates = [...formData.override_dates];
                                newDates[index] = e.target.value;
                                handleInputChange('override_dates', newDates);
                              }}
                              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newDates = formData.override_dates.filter((_, i) => i !== index);
                                handleInputChange('override_dates', newDates);
                              }}
                              className="px-3 py-2.5 bg-[#333333] text-red-400 border border-[#444444] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newDates = [...formData.override_dates, ''];
                            handleInputChange('override_dates', newDates);
                          }}
                          className="px-4 py-2.5 bg-[#333333] text-green-400 border border-[#444444] rounded-lg hover:bg-[#3a3a3a] transition-colors mt-2"
                        >
                          Add Override Date
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                        Specific dates when the job should trigger regardless of the rule
                      </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="bg-[#222222] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Metadata</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    JSON Metadata (Optional)
                  </label>
                  <textarea
                    value={metadataText}
                    onChange={(e) => {
                      setMetadataText(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value || '{}');
                        handleInputChange('metadata', parsed);
                        // Clear metadata error if it was set
                        if (formErrors.metadata) {
                          setFormErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.metadata;
                            return newErrors;
                          });
                        }
                      } catch {
                        // Set JSON error
                        setFormErrors(prev => ({
                          ...prev,
                          metadata: 'Invalid JSON format'
                        }));
                      }
                    }}
                    placeholder='{ "key": "value" }'
                    rows={3}
                    className={`w-full h-44 px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none focus:ring-1 font-mono text-sm ${
                      formErrors.metadata 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-[#333333] focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.metadata ? (
                    <p className="text-red-400 text-xs mt-2">{formErrors.metadata}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">
                      Optional JSON object for additional data (e.g., tags, configuration)
                    </p>
                  )}
                </div>
              </div>

              {/* Endpoint Configuration */}
              <div className="bg-[#222222] rounded-lg p-6 border border-[#333333]">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-4 md:w-4 md:h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">Endpoint Configuration</h3>
                  <span className="text-red-400 text-sm ml-1">*</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                      <span className="text-red-400 mr-1">*</span>
                      Callback URL
                    </label>
                    <input
                      type="url"
                      value={formData.callback_url}
                      onChange={(e) => handleInputChange('callback_url', e.target.value)}
                      placeholder="https://api.example.com/webhook"
                      required
                      className={`w-full mt-1 px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                        formErrors.callback_url 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-[#333333] focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.callback_url && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {formErrors.callback_url}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Enter the URL endpoint that will receive the HTTP POST request when the job triggers
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Validation Status */}
              {!isFormValid && (
                <div className="bg-[#291717] border border-red-500/30 rounded-lg p-5">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-red-400 text-sm font-semibold mb-2">Please fix the following issues:</h4>
                      <ul className="text-red-300 text-sm space-y-2">
                        {validateFormCompletely(formData, formErrors).map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 text-xs mt-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Footer with Action Buttons */}
          <div className="px-4 md:px-10 py-2 md:py-6 bg-[#1a1a1a] border-t border-[#333333] h-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-0">
              <div className="text-sm text-gray-400">
                <span className="flex items-center gap-2 mt-2 md:mt-0 mb-2 md:mb-0">
                  <div className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isFormValid ? 'Form is ready to submit' : 'Please complete all required fields'}
                </span>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isEdit) {
                      setEditingJob(null);
                    } else {
                      setShowCreateForm(false);
                    }
                    resetForm();
                  }}
                  className="mr-2 px-6 py-2.5 rounded-md text-sm font-medium bg-[#333333] text-gray-300 hover:bg-[#3a3a3a] hover:text-white transition-all duration-300 border border-[#444444]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="job-form"
                  disabled={!isFormValid || (isEdit ? isUpdating : isCreating)}
                  className="px-8 py-2.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1a1a1a] disabled:opacity-75 disabled:bg-blue-600/80 disabled:cursor-not-allowed"
                >
                  {(isEdit ? isUpdating : isCreating) ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEdit ? 'Updating Job...' : 'Creating Job...'}
                    </div>
                  ) : (
                    <>
                      <span>{isEdit ? 'Update Job' : 'Create Job'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobDetails = () => {
    if (!viewingJob) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] rounded-lg shadow-lg max-w-3xl w-full max-h-[100vh] overflow-hidden border border-[#2a2a2a]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#2a2a2a] flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10 gap-2">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                viewingJob.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                viewingJob.status === 'paused' ? 'bg-amber-500/10 text-amber-500' : 
                'bg-red-500/10 text-red-500'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={viewingJob.status === 'active' 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      : viewingJob.status === 'paused'
                      ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Job Details</h2>
                <p className="text-sm text-gray-400">
                  {viewingJob.status.charAt(0).toUpperCase() + viewingJob.status.slice(1)} • Created {new Date(viewingJob.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewingJob(null)}
              className="w-8 h-8 bg-[#222222] hover:bg-[#333333] rounded-md flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 border border-[#333333]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Job Identifier Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h3 className="text-white font-medium text-lg break-all">
                  {viewingJob.callback_url}
                </h3>
                <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#222222] text-gray-300 border border-[#333333]">
                  ID: {viewingJob.id.slice(0, 12)}...
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(viewingJob.status)}`}>
                  {viewingJob.status.charAt(0).toUpperCase() + viewingJob.status.slice(1)}
                </span>
                <span>•</span>
                <span>{getFreqDisplay(viewingJob)}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6 flex flex-col gap-2">
                {/* Schedule Section */}
                <div className="bg-[#222222] rounded-lg p-5 border border-[#333333]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium">Schedule</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-sm text-gray-400">Start Date:</span>
                      <span className="text-sm text-white">{viewingJob.start_date}</span>
                    </div>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-sm text-gray-400">End Date:</span>
                      <span className="text-sm text-white">{viewingJob.end_date || 'No end date'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Frequency:</span>
                      <span className="text-sm text-white text-end">{getFreqDisplay(viewingJob)}</span>
                    </div>
                    <div className="pt-2 border-t border-[#333333]">
                      <span className="text-sm text-gray-400 block mb-2">Trigger Times:</span>
                      <div className="flex flex-wrap gap-2">
                        {viewingJob.trigger_timings?.map((time, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Override Dates (if any) */}
                {viewingJob.override_dates && viewingJob.override_dates.length > 0 && (
                  <div className="bg-[#222222] rounded-lg p-5 border border-[#333333]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-white font-medium">Override Dates</h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {viewingJob.override_dates.map((date, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6 flex flex-col gap-2">
                {/* Stats Section */}
                <div className="bg-[#222222] rounded-lg p-5 border border-[#333333]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-md bg-cyan-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium">Statistics</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] border border-[#333333] rounded-md p-3">
                      <div className="text-sm text-gray-400 mb-1">Total Calls</div>
                      <div className="text-lg font-semibold text-white">{viewingJob.call_count || 0}</div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333333] rounded-md p-3">
                      <div className="text-sm text-gray-400 mb-1">Last Triggered</div>
                      <div className="text-sm font-medium text-white">
                        {viewingJob.last_triggered ? new Date(viewingJob.last_triggered).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Section (if any) */}
                {viewingJob.metadata && Object.keys(viewingJob.metadata).length > 0 && (
                  <div className="bg-[#222222] rounded-lg p-5 border border-[#333333]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-medium">Metadata</h4>
                    </div>

                    <pre className="text-white bg-[#1a1a1a] p-4 rounded-md text-sm overflow-auto border border-[#333333] font-mono max-h-[200px]">
                      {JSON.stringify(viewingJob.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#2a2a2a] bg-[#1a1a1a] flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Job ID: <span className="font-mono">{viewingJob.id}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setViewingJob(null);
                  handleEdit(viewingJob);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600/20 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Job
              </button>
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-200 border border-[#333333]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!jobToDelete) return null;

    const jobData = jobs.find(job => job.id === jobToDelete);
    if (!jobData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#333333]/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
                <svg className="w-4 h-4 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm font-medium text-red-400">Delete Job</span>
              </div>
              <button
                onClick={() => setJobToDelete(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mb-2 text-sm">
              Are you sure you want to delete this job?
            </p>
            <div className="bg-[#222222] p-3 rounded-md mb-6 border border-[#333333]/50">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{getFreqDisplay(jobData)}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(jobData.status)}`}>
                  {jobData.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1 break-all">{jobData.callback_url}</p>
            </div>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. The job will be permanently deleted and will no longer be executed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-300 border border-[#333333]/50 mr-2"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteJob(jobToDelete)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#1a1a1a] disabled:opacity-75 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  "Delete Job"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-20 h-full bg-[#111111] text-white">
      {showCreateForm && renderJobForm(false)}
      {editingJob && renderJobForm(true)}
      {viewingJob && renderJobDetails()}
      {renderDeleteConfirmation()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <h1 className="text-2xl font-semibold text-white">Jobs</h1>
            <span className="ml-3 px-2.5 py-1 text-xs font-medium bg-[#222222] text-gray-300 rounded-md border border-[#333333]/50">
              {totalJobs} total • {filteredJobs.length} showing
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-600">/</span>
            <span className="px-3 py-1.5 text-sm text-white">Jobs</span>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6 border border-[#333333]/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, URL, or metadata..."
                  className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Frequency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency
              </label>
              <select
                value={freqFilter}
                onChange={(e) => setFreqFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Frequencies</option>
                <option value="daily">Daily</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-[#222222] border border-[#333333]/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="last_triggered">Last Triggered</option>
                <option value="call_count">Call Count</option>
                <option value="status">Status</option>
                <option value="freq">Frequency</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-1 bg-[#222222] border border-[#333333]/50 rounded text-white text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || freqFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFreqFilter('all');
                  setSortBy('created_at');
                  setSortOrder('desc');
                }}
                className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/20 rounded text-sm hover:bg-red-500/30 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-white">{totalJobs}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Jobs</p>
                  <p className="text-2xl font-bold text-green-400">
                    {jobs.filter(job => job.status === 'active').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Calls</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {jobs.reduce((sum, job) => sum + (job.call_count || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Daily Jobs</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {jobs.filter(job => job.freq === 'daily').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Job Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
          >
            Create New Job
          </button>
        </div>

        {/* Jobs List */}
        <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#333333]/50 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Your Jobs</h2>
            <div className="flex items-center space-x-4">
              {filteredJobs.length > 0 && (
                <span className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * jobsPerPage) + 1}-{Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length}
                </span>
              )}
              <button
                onClick={fetchJobs}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh jobs"
              >
                <svg 
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {filteredJobs.length > 0 && (
                <button
                  onClick={exportJobs}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                  title="Export filtered jobs as JSON"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-5">
              {Array.from({ length: jobsPerPage }, (_, i) => (
                <div key={i} className="animate-pulse border-b border-[#333333]/50 last:border-b-0 p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-6 bg-[#222222] rounded w-16"></div>
                        <div className="h-4 bg-[#222222] rounded w-24"></div>
                        <div className="h-4 bg-[#222222] rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-[#222222] rounded w-3/4"></div>
                      <div className="flex items-center space-x-4">
                        <div className="h-3 bg-[#222222] rounded w-20"></div>
                        <div className="h-3 bg-[#222222] rounded w-16"></div>
                        <div className="h-3 bg-[#222222] rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-12 bg-[#222222] rounded"></div>
                      <div className="h-8 w-12 bg-[#222222] rounded"></div>
                      <div className="h-8 w-16 bg-[#222222] rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {jobs.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
                  <p className="text-gray-400 mb-4">Create your first scheduled job to get started.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium"
                  >
                    Create Job
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No jobs match your filters</h3>
                  <p className="text-gray-400 mb-4">Try adjusting your search criteria or clear all filters.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setFreqFilter('all');
                      setSortBy('created_at');
                      setSortOrder('desc');
                    }}
                    className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/20 rounded-md hover:bg-gray-500/30 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Jobs Table */}
              <div className="overflow-x-auto">
                                  <div className="divide-y divide-[#333333]/50">
                    {paginatedJobs.map((job) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        onView={setViewingJob}
                        onEdit={handleEdit}
                        onDelete={setJobToDelete}
                      />
                    ))}
                  </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-[#333333]/50 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-400">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm border border-[#333333]/50 rounded transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-[#222222] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm bg-[#222222] border border-[#333333]/50 rounded text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 