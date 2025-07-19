
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is available globally
(window as any).React = React;

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center bg-gray-100'
      }, React.createElement('div', {
        className: 'text-center p-8'
      }, [
        React.createElement('h1', { 
          key: 'title',
          className: 'text-2xl font-bold text-gray-800 mb-4' 
        }, 'تعذر تحميل التطبيق'),
        React.createElement('p', { 
          key: 'message',
          className: 'text-gray-600 mb-4' 
        }, 'يرجى إعادة تحميل الصفحة'),
        React.createElement('button', {
          key: 'button',
          className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
          onClick: () => window.location.reload()
        }, 'إعادة تحميل')
      ]));
    }

    return this.props.children;
  }
}

root.render(
  React.createElement(StrictMode, null,
    React.createElement(ErrorBoundary, null,
      React.createElement(App)
    )
  )
);
