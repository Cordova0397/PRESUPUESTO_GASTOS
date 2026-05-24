import { Navigate, createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./AppLayout";
import { ActualExpensesPage } from "../pages/ActualExpensesPage";
import { AnalysisPage } from "../pages/AnalysisPage";
import { CatalogsPage } from "../pages/CatalogsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PlannedExpensesPage } from "../pages/PlannedExpensesPage";
import { VariancePage } from "../pages/VariancePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "catalogs",
        element: <CatalogsPage />
      },
      {
        path: "planned-expenses",
        element: <PlannedExpensesPage />
      },
      {
        path: "actual-expenses",
        element: <ActualExpensesPage />
      },
      {
        path: "variance",
        element: <VariancePage />
      },
      {
        path: "analysis",
        element: <AnalysisPage />
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
]);
