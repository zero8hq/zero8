"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

export default function JobForm({ 
  onClose, 
  onSubmit, 
  initialData = null, 
  isSubmitting = false 
}) {
  // Initialize form state
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    trigger_timings: ["09:00"],
    freq: "daily",
    rule_type: "",
    rule_value: "",
    override_dates: [],
    callback_url: "",
    metadata: {},
    status: "active"
  });
  
  // Form UI states
  const [metadataText, setMetadataText] = useState('{}');
  const [newTiming, setNewTiming] = useState("09:00");
  const [newOverrideDate, setNewOverrideDate] = useState("");
  const [weekdays, setWeekdays] = useState({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
  });
  const [monthDays, setMonthDays] = useState(
    Array(31).fill(false).reduce((acc, _, i) => {
      acc[i + 1] = false;
      return acc;
    }, {})
  );
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      // Prepare form data based on job type
      let formValues = {
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        freq: initialData.freq || "daily",
        callback_url: initialData.callback_url || "",
        metadata: initialData.metadata || {},
        status: initialData.status || "active"
      };
      
      // Handle fields based on frequency type
      if (initialData.freq === "recurring") {
        formValues.rule_type = initialData.rule_type || "minutes";
        formValues.rule_value = initialData.rule_value || "60";
        formValues.trigger_timings = [];
        formValues.override_dates = [];
      } else if (initialData.freq === "daily") {
        formValues.rule_type = null;
        formValues.rule_value = null;
        formValues.override_dates = [];
        formValues.trigger_timings = initialData.trigger_timings || ["09:00"];
      } else if (initialData.freq === "custom") {
        formValues.rule_type = initialData.rule_type || "";
        formValues.rule_value = initialData.rule_value || "";
        formValues.override_dates = initialData.override_dates || [];
        formValues.trigger_timings = initialData.trigger_timings || ["09:00"];
      }
      
      setFormData(formValues);
      
      // Set metadata text
      setMetadataText(JSON.stringify(initialData.metadata || {}, null, 2));
      
      // Set weekdays if rule_type is weekly
      if (initialData.rule_type === "weekly" && Array.isArray(initialData.rule_value)) {
        const weekdayValues = { ...weekdays };
        initialData.rule_value.forEach(day => {
          weekdayValues[day] = true;
        });
        setWeekdays(weekdayValues);
      }
      
      // Set month days if rule_type is monthly
      if (initialData.rule_type === "monthly" && Array.isArray(initialData.rule_value)) {
        const monthDayValues = { ...monthDays };
        initialData.rule_value.forEach(day => {
          monthDayValues[day] = true;
        });
        setMonthDays(monthDayValues);
      }
    }
  }, [initialData]);
  
  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    
    // Validate callback URL
    if (!formData.callback_url) {
      errors.callback_url = "Callback URL is required";
      isValid = false;
    } else if (!isValidUrl(formData.callback_url)) {
      errors.callback_url = "Please enter a valid URL";
      isValid = false;
    }
    
    // Validate metadata
    try {
      if (metadataText.trim()) {
        JSON.parse(metadataText);
      }
    } catch (e) {
      errors.metadata = "Please enter valid JSON";
      isValid = false;
    }
    
    // Validate start date
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
      isValid = false;
    } else if (!isValidISODate(formData.start_date)) {
      errors.start_date = "Please enter a valid date";
      isValid = false;
    }
    
    // Validate end date only if provided
    if (formData.end_date && !isValidISODate(formData.end_date)) {
      errors.end_date = "Please enter a valid date";
      isValid = false;
    }
    
    // Validate dates relationship
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      errors.end_date = "End date must be after start date";
      isValid = false;
    }
    
    // Frequency-specific validations
    if (formData.freq === "daily") {
      // Validate trigger timings for daily jobs
      if (!formData.trigger_timings || formData.trigger_timings.length === 0) {
        errors.trigger_timings = "At least one trigger time is required";
        isValid = false;
      } else {
        // Check format of each trigger timing
        const invalidTimings = formData.trigger_timings.filter(time => !isValidTimeFormat(time));
        if (invalidTimings.length > 0) {
          errors.trigger_timings = "Please enter valid time formats (HH:MM)";
          isValid = false;
        }
      }
    } 
    else if (formData.freq === "custom") {
      // Validate trigger timings for custom jobs
      if (!formData.trigger_timings || formData.trigger_timings.length === 0) {
        errors.trigger_timings = "At least one trigger time is required";
        isValid = false;
      } else {
        // Check format of each trigger timing
        const invalidTimings = formData.trigger_timings.filter(time => !isValidTimeFormat(time));
        if (invalidTimings.length > 0) {
          errors.trigger_timings = "Please enter valid time formats (HH:MM)";
          isValid = false;
        }
      }
      
      // Check if either rule_type or override_dates is provided
      const hasRuleType = formData.rule_type && formData.rule_type !== "";
      const hasOverrideDates = formData.override_dates && formData.override_dates.length > 0;
      
      if (!hasRuleType && !hasOverrideDates) {
        errors.custom = "Either select a rule type or provide override dates";
        isValid = false;
      }
      
      // If rule type is provided, validate rule value
      if (hasRuleType) {
        if (formData.rule_type === "weekly") {
          // Check if any weekdays are selected
          const selectedWeekdays = Object.keys(weekdays).filter(day => weekdays[day]);
          if (!selectedWeekdays.length) {
            errors.weekdays = "Please select at least one day of the week";
            isValid = false;
          }
        } else if (formData.rule_type === "monthly") {
          // Check if any month days are selected
          const selectedMonthDays = Object.keys(monthDays).filter(day => monthDays[day]);
          if (!selectedMonthDays.length) {
            errors.monthdays = "Please select at least one day of the month";
            isValid = false;
          }
        } else if (formData.rule_type === "interval") {
          // Check if interval value is valid
          if (!formData.rule_value || isNaN(Number(formData.rule_value)) || Number(formData.rule_value) <= 0) {
            errors.rule_value = "Please enter a valid positive number";
            isValid = false;
          }
        }
      }
      
      // Validate override dates if provided
      if (hasOverrideDates) {
        const invalidDates = formData.override_dates.filter(date => !isValidISODate(date));
        if (invalidDates.length > 0) {
          errors.override_dates = "Please enter valid dates";
          isValid = false;
        }
      }
    } 
    else if (formData.freq === "recurring") {
      // Validate rule_type for recurring jobs
      if (!formData.rule_type || !["minutes", "hours"].includes(formData.rule_type)) {
        errors.rule_type = "Please select minutes or hours";
        isValid = false;
      }
      
      // Validate rule_value for recurring jobs
      if (!formData.rule_value || isNaN(Number(formData.rule_value)) || Number(formData.rule_value) <= 0) {
        errors.rule_value = "Please enter a valid positive number";
        isValid = false;
      } else {
        // Additional validation for specific rule types
        const value = Number(formData.rule_value);
        if (formData.rule_type === "minutes" && value > 1440) {
          errors.rule_value = "Minutes cannot exceed 1440 (24 hours)";
          isValid = false;
        } else if (formData.rule_type === "hours" && value > 24) {
          errors.rule_value = "Hours cannot exceed 24";
          isValid = false;
        }
      }
    }
    
    setErrors(errors);
    setIsValid(isValid);
    return isValid;
  }, [formData, metadataText, weekdays, monthDays]);
  
  // Validate form data when it changes
  useEffect(() => {
    validateForm();
  }, [formData, metadataText, validateForm]);
  
  // Helper to validate URL format
  const isValidUrl = (str) => {
    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Helper to validate ISO date format
  const isValidISODate = (str) => {
    if (!str) return false;
    const date = new Date(str);
    return !isNaN(date) && date.toISOString().split('T')[0] === str;
  };
  
  // Helper to validate time format (HH:MM)
  const isValidTimeFormat = (timeStr) => {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(timeStr);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run validation before submission
    const isFormValid = validateForm();
    if (!isFormValid) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    
    try {
      // Prepare form data for submission
      const submissionData = {
        ...formData
      };
      
      // Handle metadata
      try {
        submissionData.metadata = metadataText.trim() ? JSON.parse(metadataText) : {};
      } catch (e) {
        toast.error("Invalid metadata JSON");
        return;
      }
      
      // Convert empty end_date to null
      if (!submissionData.end_date) {
        submissionData.end_date = null;
      }
      
      // Process data based on frequency type to meet API validation requirements
      if (submissionData.freq === "daily") {
        // For daily frequency, we must REMOVE these fields entirely
        delete submissionData.rule_type;
        delete submissionData.rule_value;
        delete submissionData.override_dates;
      } else if (submissionData.freq === "recurring") {
        // For recurring frequency, we must REMOVE these fields
        delete submissionData.trigger_timings;
        delete submissionData.override_dates;
        
        // Ensure rule_value is a number for recurring jobs
        submissionData.rule_value = parseInt(submissionData.rule_value);
      } else if (submissionData.freq === "custom") {
        // For custom frequency with interval rule type, ensure rule_value is a number
        if (submissionData.rule_type === "interval") {
          submissionData.rule_value = parseInt(submissionData.rule_value);
        }
        
        // If no rule_type is set for custom frequency, ensure it's null
        if (!submissionData.rule_type || submissionData.rule_type === "") {
          submissionData.rule_type = null;
          submissionData.rule_value = null;
        }
        
        // If no override_dates, set to null instead of empty array
        if (!submissionData.override_dates || submissionData.override_dates.length === 0) {
          submissionData.override_dates = null;
        }
      }
      
      console.log("Submitting data:", submissionData);
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit the form");
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for frequency changes
    if (name === "freq") {
      const newFormData = { ...formData, freq: value };
      
      // Reset relevant fields based on frequency type
      if (value === "daily") {
        // For daily frequency, make sure these fields are empty to avoid validation errors
        newFormData.rule_type = null;
        newFormData.rule_value = null;
        newFormData.override_dates = null;
        newFormData.trigger_timings = formData.trigger_timings.length ? formData.trigger_timings : ["09:00"];
      } else if (value === "recurring") {
        // For recurring, we need to remove trigger_timings and override_dates
        // but keep them in the form state as empty arrays for proper UI handling
        newFormData.trigger_timings = [];
        newFormData.override_dates = [];
        newFormData.rule_type = "minutes";
        newFormData.rule_value = "60";
      } else if (value === "custom") {
        // When switching to custom, ensure we have valid trigger_timings
        newFormData.trigger_timings = formData.trigger_timings.length ? formData.trigger_timings : ["09:00"];
        
        // For custom frequency, always initialize with weekly rule type and Monday selected
        // This ensures the form is valid when switching from recurring to custom
        newFormData.rule_type = "weekly";
        newFormData.rule_value = ["mon"];
        
        // Initialize weekdays with Monday selected
        const newWeekdays = {
          mon: true,
          tue: false,
          wed: false, 
          thu: false, 
          fri: false, 
          sat: false, 
          sun: false
        };
        setWeekdays(newWeekdays);
      }
      
      setFormData(newFormData);
      
      // Force validation to run immediately after frequency change
      setTimeout(() => validateForm(), 0);
    } else if (name === "rule_type") {
      // Reset rule value when rule type changes
      setFormData({
        ...formData,
        rule_type: value,
        rule_value: ""
      });
      
      if (value === "weekly") {
        setWeekdays({
          mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
        });
      } else if (value === "monthly") {
        const resetMonthDays = {};
        for (let i = 1; i <= 31; i++) {
          resetMonthDays[i] = false;
        }
        setMonthDays(resetMonthDays);
      }
      
      // Force validation to run immediately after rule type change
      setTimeout(() => validateForm(), 0);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Add a new trigger time
  const addTriggerTime = () => {
    if (newTiming && isValidTimeString(newTiming)) {
      if (!formData.trigger_timings.includes(newTiming)) {
        const sortedTimings = [...formData.trigger_timings, newTiming].sort();
        setFormData({
          ...formData,
          trigger_timings: sortedTimings
        });
        setNewTiming("09:00");
      } else {
        toast.error("Time already added");
      }
    } else {
      toast.error("Please enter a valid time");
    }
  };
  
  // Remove a trigger time
  const removeTriggerTime = (time) => {
    if (formData.trigger_timings.length > 1) {
      setFormData({
        ...formData,
        trigger_timings: formData.trigger_timings.filter(t => t !== time)
      });
    } else {
      toast.error("At least one trigger time is required");
    }
  };
  
  // Add an override date
  const addOverrideDate = () => {
    if (newOverrideDate && isValidDateString(newOverrideDate)) {
      if (!formData.override_dates.includes(newOverrideDate)) {
        const sortedDates = [...formData.override_dates, newOverrideDate].sort();
        setFormData({
          ...formData,
          override_dates: sortedDates
        });
        setNewOverrideDate("");
      } else {
        toast.error("Date already added");
      }
    } else {
      toast.error("Please enter a valid date");
    }
  };
  
  // Remove an override date
  const removeOverrideDate = (date) => {
    setFormData({
      ...formData,
      override_dates: formData.override_dates.filter(d => d !== date)
    });
  };
  
  // Handle weekday selection for weekly rules
  const handleWeekdayToggle = (day) => {
    setWeekdays({
      ...weekdays,
      [day]: !weekdays[day]
    });
    
    // Update rule_value in formData
    const newSelectedDays = {
      ...weekdays,
      [day]: !weekdays[day]
    };
    
    setFormData({
      ...formData,
      rule_value: Object.keys(newSelectedDays).filter(d => newSelectedDays[d])
    });
  };
  
  // Handle month day selection for monthly rules
  const handleMonthDayToggle = (day) => {
    setMonthDays({
      ...monthDays,
      [day]: !monthDays[day]
    });
    
    // Update rule_value in formData
    const newSelectedDays = {
      ...monthDays,
      [day]: !monthDays[day]
    };
    
    setFormData({
      ...formData,
      rule_value: Object.keys(newSelectedDays)
        .filter(d => newSelectedDays[d])
        .map(d => parseInt(d))
    });
  };
  
  // Helper to validate time string
  const isValidTimeString = (timeString) => {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timePattern.test(timeString);
  };
  
  // Helper to validate date string
  const isValidDateString = (dateString) => {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {initialData ? "Edit Job" : "Create New Job"}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.status ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>
          
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Frequency Type *
            </label>
            <select
              name="freq"
              value={formData.freq}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.freq ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="daily">Daily</option>
              <option value="custom">Custom</option>
              <option value="recurring">Recurring (Interval-based)</option>
            </select>
            {errors.freq && (
              <p className="mt-1 text-sm text-red-500">{errors.freq}</p>
            )}
          </div>
          
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.start_date ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
            )}
          </div>
          
          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.end_date ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
            )}
          </div>
          
          {/* Callback URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Callback URL *
            </label>
            <input
              type="text"
              name="callback_url"
              value={formData.callback_url}
              onChange={handleChange}
              placeholder="https://your-api.example.com/webhook"
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.callback_url ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.callback_url && (
              <p className="mt-1 text-sm text-red-500">{errors.callback_url}</p>
            )}
          </div>
        </div>
        
        {/* Frequency-specific fields */}
        {(formData.freq === "daily" || formData.freq === "custom") && (
          <div className="mb-6">
            <div className="border border-[#333333]/50 rounded-lg p-4 bg-[#1f1f1f]">
              <h3 className="text-md font-medium text-white mb-3">Trigger Times</h3>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.trigger_timings.map((time) => (
                  <div
                    key={time}
                    className="flex items-center bg-[#2a2a2a] border border-[#3a3a3a]/50 rounded px-3 py-1.5"
                  >
                    <span className="text-sm text-white">{time}</span>
                    <button
                      type="button"
                      onClick={() => removeTriggerTime(time)}
                      className="ml-2 text-gray-400 hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value)}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTriggerTime}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
              {errors.trigger_timings && (
                <p className="mt-2 text-sm text-red-500">{errors.trigger_timings}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Custom Frequency Rules */}
        {formData.freq === "custom" && (
          <div className="mb-6">
            <div className="border border-[#333333]/50 rounded-lg p-4 bg-[#1f1f1f]">
              <div className="flex flex-wrap items-center mb-4 gap-2">
                <h3 className="text-md font-medium text-white">Custom Schedule Rules</h3>
                {errors.custom && (
                  <div className="text-sm text-red-500 font-medium">
                    {errors.custom}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Type
                </label>
                <select
                  name="rule_type"
                  value={formData.rule_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-[#222222] border ${
                    errors.rule_type ? "border-red-500" : "border-[#333333]/50"
                  } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Select a rule type</option>
                  <option value="weekly">Weekly (specific days)</option>
                  <option value="monthly">Monthly (specific days)</option>
                  <option value="interval">Interval (every X days)</option>
                </select>
                {errors.rule_type && (
                  <p className="mt-1 text-sm text-red-500">{errors.rule_type}</p>
                )}
              </div>
              
              {/* Rule Value - Weekly */}
              {formData.rule_type === "weekly" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Days of the Week
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWeekdayToggle(day)}
                        className={`py-2 px-1 rounded text-sm ${
                          weekdays[day]
                            ? "bg-blue-500 text-white"
                            : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]"
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    ))}
                  </div>
                  {errors.rule_value && (
                    <p className="mt-2 text-sm text-red-500">{errors.rule_value}</p>
                  )}
                </div>
              )}
              
              {/* Rule Value - Monthly */}
              {formData.rule_type === "monthly" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Days of the Month
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleMonthDayToggle(day)}
                        className={`py-2 rounded text-sm ${
                          monthDays[day]
                            ? "bg-blue-500 text-white"
                            : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {errors.rule_value && (
                    <p className="mt-2 text-sm text-red-500">{errors.rule_value}</p>
                  )}
                </div>
              )}
              
              {/* Rule Value - Interval */}
              {formData.rule_type === "interval" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Every X Days
                  </label>
                  <input
                    type="number"
                    name="rule_value"
                    value={formData.rule_value}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 7 for weekly, 14 for bi-weekly"
                    className={`w-full px-3 py-2 bg-[#222222] border ${
                      errors.rule_value ? "border-red-500" : "border-[#333333]/50"
                    } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.rule_value && (
                    <p className="mt-1 text-sm text-red-500">{errors.rule_value}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Override Dates */}
            <div className="border border-[#333333]/50 rounded-lg p-4 bg-[#1f1f1f]">
              <h3 className="text-md font-medium text-white mb-3">Override Dates (Optional)</h3>
              
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">
                  Add specific dates that override the rule pattern.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.override_dates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center bg-[#2a2a2a] border border-[#3a3a3a]/50 rounded px-3 py-1.5"
                    >
                      <span className="text-sm text-white">{date}</span>
                      <button
                        type="button"
                        onClick={() => removeOverrideDate(date)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Add Date
                    </label>
                    <input
                      type="date"
                      value={newOverrideDate}
                      onChange={(e) => setNewOverrideDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addOverrideDate}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recurring Frequency Options */}
        {formData.freq === "recurring" && (
          <div className="mb-6">
            <div className="border border-[#333333]/50 rounded-lg p-4 bg-[#1f1f1f]">
              <h3 className="text-md font-medium text-white mb-3">Recurring Interval</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interval Type
                  </label>
                  <select
                    name="rule_type"
                    value={formData.rule_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-[#222222] border ${
                      errors.rule_type ? "border-red-500" : "border-[#333333]/50"
                    } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                  {errors.rule_type && (
                    <p className="mt-1 text-sm text-red-500">{errors.rule_type}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {formData.rule_type === "minutes" ? "Every X Minutes" : "Every X Hours"}
                  </label>
                  <input
                    type="number"
                    name="rule_value"
                    value={formData.rule_value}
                    onChange={handleChange}
                    min="1"
                    max={formData.rule_type === "minutes" ? "1440" : "24"}
                    className={`w-full px-3 py-2 bg-[#222222] border ${
                      errors.rule_value ? "border-red-500" : "border-[#333333]/50"
                    } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.rule_value && (
                    <p className="mt-1 text-sm text-red-500">{errors.rule_value}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-400">
                  {formData.rule_type === "minutes" 
                    ? "This job will run every " + (formData.rule_value || "X") + " minutes, starting from the job creation time."
                    : "This job will run every " + (formData.rule_value || "X") + " hours, starting from the job creation time."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Metadata */}
        <div className="mb-6">
          <div className="border border-[#333333]/50 rounded-lg p-4 bg-[#1f1f1f]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Metadata (JSON, Optional)
            </label>
            <textarea
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              rows={5}
              className={`w-full px-3 py-2 bg-[#222222] border ${
                errors.metadata ? "border-red-500" : "border-[#333333]/50"
              } rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm`}
              placeholder='{
  "description": "My job description",
  "tags": ["important", "monthly-report"],
  "priority": "high"
}'
            />
            {errors.metadata && (
              <p className="mt-1 text-sm text-red-500">{errors.metadata}</p>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`px-6 py-2 rounded-md text-white font-medium shadow-lg ${
              isValid && !isSubmitting
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-blue-500/30"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            } transition-all duration-300`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : initialData ? "Update Job" : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
} 