import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import ErrorPage from './error-page';
import Main from "./routes/main";
import City from "./routes/City";
import CityLayout from './routes/CityLayout';
import About from './routes/About';
import Root from './routes/root';
import Profile from './routes/Profile';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
          <Route index element={<Main />} />
          <Route path="cities/:cityId" element={<CityLayout />}>
            <Route index element={<City />} />
            <Route path="profiles/:profileId" element={<Profile />} />
          </Route>
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
