// src/App.jsx - MAIN APPLICATION ENTRY POINT
import React from 'react';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/globals.css';

/**
 * Main Application Component
 * 
 * This is the root component that initializes the entire dashboard application.
 * It provides error boundary protection and global styling.
 * 
 * This file is imported by src/index.js and rendered to the DOM.
 */

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;