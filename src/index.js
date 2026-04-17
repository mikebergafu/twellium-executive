import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { RefreshProvider } from './context/RefreshContext';
import { FilterProvider } from './context/FilterContext';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add Inter font to document head
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <RefreshProvider>
        <FilterProvider>
          <App />
        </FilterProvider>
      </RefreshProvider>
    </ThemeProvider>
  </React.StrictMode>
);


reportWebVitals();
