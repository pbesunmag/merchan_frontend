import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import logoFavicon from './assets/logo_tienda.png';

const linkFavicon = document.querySelector("link[rel~='icon']") || document.createElement('link');
linkFavicon.type = 'image/png';
linkFavicon.rel = 'icon';
linkFavicon.href = logoFavicon;
document.getElementsByTagName('head')[0].appendChild(linkFavicon);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);