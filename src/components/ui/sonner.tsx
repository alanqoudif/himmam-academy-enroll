
import * as React from "react";

// Simple toast function for sonner compatibility
export function toast(message: string | { title?: string; description?: string }) {
  const toastMessage = typeof message === 'string' ? message : message.description || message.title || '';
  
  // Create a simple toast notification
  const toastEl = document.createElement('div');
  toastEl.className = 'fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm';
  toastEl.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="text-gray-800">${toastMessage}</span>
      <button class="ml-2 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(toastEl);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
  }, 5000);
}

export function Toaster() {
  return null; // Simple implementation
}
