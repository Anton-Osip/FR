import { HomePage } from "@pages/home";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Profile } from "@pages/profile";
import {Bonuses} from "@pages/bonuses";

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
        {
            path: "bonuses",
            element: <Bonuses />,
        },
    ],
  },
]);
