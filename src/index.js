import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Root, {loader as rootLoader} from './routes/root';
import ErrorPage from './error-page'
import Profile, {
  loader as profileLoader,
} from "./routes/Profile";
import Main from "./routes/main";
import City from "./routes/City";


const root = ReactDOM.createRoot(document.getElementById('root'));


const router = createBrowserRouter([
  {
    path: "/",
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
        path: "profiles/:profileId",
        element: <Profile />,
        loader: profileLoader,
      },
      {
        path: "cities/:cityId",
        element: <City />,
        loader: rootLoader
      }
    ],
  },

]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);