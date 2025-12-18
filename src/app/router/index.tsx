import { HomePage } from "@pages/home";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Profile } from "@pages/profile";
import { Bonuses } from "@pages/bonuses";
import { Favorites } from "@pages/favorites";
import { Invite } from "@pages/invite";
import { APP_PATH } from "@shared/constants/constants";

// Helper function to get relative path for router children
const getRelativePath = (path: string) => path.slice(1);

export const router = createBrowserRouter([
  {
    path: APP_PATH.main,
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: getRelativePath(APP_PATH.profile),
        element: <Profile />,
      },
      {
        path: getRelativePath(APP_PATH.bonuses),
        element: <Bonuses />,
      },
      {
        path: getRelativePath(APP_PATH.favorites),
        element: <Favorites />,
      },
      {
        path: getRelativePath(APP_PATH.invite),
        element: <Invite />,
      },
    ],
  },
]);
