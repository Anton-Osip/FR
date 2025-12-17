import { HomePage } from "@pages/home";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Profile } from "@pages/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);
