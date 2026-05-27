import ReactDOM from 'react-dom/client';
import React from 'react';
import { App } from './app/app';
import './index.css';
import { initObservability } from './lib/observability';
import { initAnalytics, trackPageView } from './lib/analytics';
import { router } from './app/router';

initObservability();
initAnalytics(() => trackPageView(router.state.location));

let lastPath = `${router.state.location.pathname}${router.state.location.search}`;
router.subscribe((state) => {
  const currentPath = `${state.location.pathname}${state.location.search}`;
  if (currentPath !== lastPath) {
    lastPath = currentPath;
    trackPageView(state.location);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
