
import * as React from "react"

export interface Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

// Simple state management without complex hooks
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  listeners.forEach(listener => listener([...toasts]));
}

let idCounter = 0;

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = `toast-${++idCounter}`;
  const newToast: Toast = { id, title, description, variant };
  
  toasts.push(newToast);
  notify();
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 5000);
  
  return {
    id,
    dismiss: () => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }
  };
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>([]);
  
  React.useEffect(() => {
    const listener = (newToasts: Toast[]) => setState(newToasts);
    listeners.push(listener);
    
    // Initial state
    setState([...toasts]);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  
  return {
    toasts: state,
    toast,
    dismiss: (toastId: string) => {
      toasts = toasts.filter(t => t.id !== toastId);
      notify();
    }
  };
}
