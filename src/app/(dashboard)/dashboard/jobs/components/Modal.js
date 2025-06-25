"use client";

import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, size = "md", children }) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent scrolling of the background content
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes for modal
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4"
  };

  const modalSizeClass = sizeClasses[size] || sizeClasses.md;

  // Handle click on the backdrop (modal background)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div 
        className={`w-full ${modalSizeClass} max-h-[95vh] overflow-hidden flex flex-col rounded-lg shadow-lg transform transition-all`}
      >
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
} 