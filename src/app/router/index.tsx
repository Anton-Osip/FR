import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@pages/home";
import { MainLayout } from "../layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
