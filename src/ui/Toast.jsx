import React, { useState, useEffect } from 'react';

export const showToast = (message, duration = 3000, className="normal") => {
  // Remove any existing toast
  const existingToast = document.getElementById('simple-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.classList.add("toast",className);
  toast.textContent = message;

  // Add to page
  document.body.appendChild(toast);

  const FADE_DURATION = 300; // Also defined in the CSS
  // Auto-remove after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      // Remove from DOM after fade out completes
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, FADE_DURATION);
    }
  }, duration);
};