import React, { useEffect } from 'react';
import { ThemeProvider, generateThemeCSS } from './contexts/ThemeProvider';
import { Dashboard } from './components/dashboard'; // ✅ NEW: Import your new Dashboard
import { ToastProvider } from './components/ui/Toast';
import './App.css';

// Inject theme CSS into the document
const injectThemeCSS = () => {
  const existingStyle = document.getElementById('theme-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'theme-styles';
  style.textContent = generateThemeCSS();
  document.head.appendChild(style);
};

function App() {
  useEffect(() => {
    // Inject theme CSS when app loads
    injectThemeCSS();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="App">
          <Dashboard /> {/* ✅ CHANGED: Use new Dashboard instead of RequirementsDashboard */}
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;