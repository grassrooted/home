import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root, { loader as rootLoader } from './routes/root';
import ErrorPage from './error-page';
import Profile, { loader as profileLoader } from "./routes/Profile";
import Main from "./routes/main";
import City from "./routes/City";
import CityLayout from './routes/CityLayout';
import About from './routes/About';
import {loader as cityLoader } from "./routes/City";

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    children: [
      { 
        index: true, 
        element: <Main />,
        loader: rootLoader
      },
      {
        path: "cities/:cityId",
        element: <CityLayout />,
        loader: rootLoader,
        children: [
          {
            index: true,
            element: <City />,
            loader: cityLoader,
          },
          {
            path: "profiles/:profileId",
            element: <Profile />,
            loader: profileLoader,
          },
        ],
      },
      {
        path: "about",
        element: <About />
      }
    ],
  },
]);


root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);