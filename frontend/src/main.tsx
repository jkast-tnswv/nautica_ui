import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { configureGrpc } from '@core/services/grpc-transport'
import App from './App'
import './styles/variables.css';
import './styles/base.css';
import './styles/navigation.css';
import './styles/cards.css';
import './styles/tables.css';
import './styles/forms.css';
import './styles/components.css';
import './styles/overlays.css';
import './styles/pages.css';
import './styles/tidewatch.css';
import './styles/game.css';
import './styles/theme-overrides.css';

// Initialize gRPC transport pointing at Envoy proxy
configureGrpc({
  baseUrl: import.meta.env.VITE_GRPC_URL || 'http://localhost:8080',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
