import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
    createHashRouter,
} from "react-router-dom";
import './index.css';
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import FinancePage from "./routes/finance-page";

const router = createHashRouter(
            createRoutesFromElements(

                <Route path="/:token" element={<Root />} >,
                    <Route
                            path="finance/:context"
                        element={<FinancePage />}
                        errorElement={<ErrorPage />}
                        />
                    </Route>
            ));

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
  </React.StrictMode>,
)
