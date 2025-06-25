"use client";

import React, { useState } from "react";

export default function DeleteConfirmation({ job, onCancel, onConfirm, isDeleting }) {
  const [confirmText, setConfirmText] = useState("");
  const requiredText = "delete";
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#333333]/50 flex items-center justify-between">
        <h3 className="text-lg font-medium text-red-400">Delete Job</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
          disabled={isDeleting}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-400">This action cannot be undone</span>
        </div>
        
        <p className="text-white mb-4">
          Are you sure you want to delete this job? This will permanently remove the job and cancel all future triggers.
        </p>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Job ID</p>
          <p className="text-md font-mono text-white">{job.id}</p>
        </div>
        
        {job.callback_url && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Callback URL</p>
            <p className="text-sm font-mono text-white truncate">{job.callback_url}</p>
          </div>
        )}
        
        <div className="mt-6">
          <label className="block text-sm text-gray-400 mb-2">
            Type <span className="text-red-400 font-semibold">{requiredText}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toLowerCase())}
            placeholder={requiredText}
            className="w-full px-3 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={isDeleting}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#333333]/50 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-[#222222] border border-[#333333]/50 rounded text-white text-sm hover:bg-[#2a2a2a] transition-colors"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={confirmText !== requiredText || isDeleting}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            confirmText === requiredText && !isDeleting
              ? "bg-red-500 hover:bg-red-600"
              : "bg-red-500/30 cursor-not-allowed"
          } transition-all duration-300`}
        >
          {isDeleting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </span>
          ) : (
            "Delete Job"
          )}
        </button>
      </div>
    </div>
  );
} 