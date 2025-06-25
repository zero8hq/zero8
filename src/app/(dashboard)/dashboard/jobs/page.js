"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

import JobForm from "./components/JobForm";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import DeleteConfirmation from "./components/DeleteConfirmation";
import Modal from "./components/Modal";

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
    if (job.freq === 'recurring') {
      if (job.rule_type === 'minutes') return `Every ${job.rule_value} minutes`;
      if (job.rule_type === 'hours') return `Every ${job.rule_value} hours`;
      return 'Recurring';
    }
    return job.freq;
  };

  // Handle form submission for creating jobs
  const handleCreateJob = async (formData) => {
    setIsCreating(true);
    try {
      console.log("Creating job with data:", formData);
      
      const response = await fetch("/api/dashboard/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      // For debugging
      const responseText = await response.text();
      console.log("Raw create response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`${data.error}: ${data.details.join(", ")}`);
        }
        throw new Error(data.error || "Failed to create job");
      }
      
      toast.success("Job created successfully");
      setShowCreateForm(false);
      fetchJobs(); // Refresh job list
    } catch (error) {
      toast.error(error.message || "Failed to create job");
      console.error("Error creating job:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle form submission for updating jobs
  const handleUpdateJob = async (formData) => {
    if (!editingJob) return;
    
    setIsUpdating(true);
    try {
      console.log("Updating job with data:", formData);
      
      const response = await fetch(`/api/dashboard/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      // For debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`${data.error}: ${data.details.join(", ")}`);
        }
        throw new Error(data.error || "Failed to update job");
      }
      
      toast.success("Job updated successfully");
      setEditingJob(null);
      fetchJobs(); // Refresh job list
    } catch (error) {
      toast.error(error.message || "Failed to update job");
      console.error("Error updating job:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/jobs/${jobToDelete.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete job");
      }
      
      toast.success("Job deleted successfully");
      setJobToDelete(null);
      fetchJobs(); // Refresh job list
    } catch (error) {
      toast.error(error.message || "Failed to delete job");
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-20 h-full bg-[#111111] text-white">
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
                <option value="recurring">Recurring</option>
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

        {/* Jobs List Container */}
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

          {/* Job List Component */}
          <JobList 
            jobs={paginatedJobs} 
            onEdit={setEditingJob}
            onDelete={setJobToDelete}
            onView={setViewingJob}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      
      {/* Modals */}
      {/* Create/Edit Job Modal */}
      <Modal 
        isOpen={showCreateForm || !!editingJob} 
        onClose={() => {
          setShowCreateForm(false);
          setEditingJob(null);
        }}
        size="lg"
      >
        <JobForm 
          onClose={() => {
            setShowCreateForm(false);
            setEditingJob(null);
          }}
          onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
          initialData={editingJob}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>
      
      {/* View Job Details Modal */}
      <Modal 
        isOpen={!!viewingJob} 
        onClose={() => setViewingJob(null)}
        size="lg"
      >
        {viewingJob && (
          <JobDetails 
            job={viewingJob} 
            onClose={() => setViewingJob(null)} 
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!jobToDelete} 
        onClose={() => !isDeleting && setJobToDelete(null)}
        size="sm"
      >
        {jobToDelete && (
          <DeleteConfirmation 
            job={jobToDelete} 
            onCancel={() => setJobToDelete(null)}
            onConfirm={handleDeleteJob}
            isDeleting={isDeleting}
          />
        )}
      </Modal>
    </div>
  );
} 