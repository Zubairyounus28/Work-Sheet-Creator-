import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Retry slightly later if root is missing, or log error
    console.error("Root element not found during mount.");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}