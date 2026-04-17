import React from 'react';
import { AppRouter } from './routes/AppRouter';
import './index.css';

function App() {
  React.useEffect(() => {
    // Initialize Bootstrap components
    if (window.bootstrap) {
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltips.forEach(el => new window.bootstrap.Tooltip(el));
    }
  }, []);

  return <AppRouter />;
}

export default App;
