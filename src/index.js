import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Root, {loader as rootLoader} from './routes/root';
import ErrorPage from './error-page'
import Profile, {
  loader as profileLoader,
} from "./routes/Profile";

const root = ReactDOM.createRoot(document.getElementById('root'));


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    children: [
      {
        path: "profiles/:profileId",
        element: <Profile />,
        loader: profileLoader,
      },
    ],
  },

]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);