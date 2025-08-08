import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h2>Failed to load application</h2>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Reload</button>
      </div>
    `;
  }
}
