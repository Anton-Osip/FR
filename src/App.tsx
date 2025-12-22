import { type FC } from 'react';

import './App.scss';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

import { MainLayout } from '@app/layouts/MainLayout';

import { Bonuses } from '@pages/bonuses';
import { Favorites } from '@pages/favorites';
import { HomePage } from '@pages/home';
import { Invite } from '@pages/invite';
import { Profile } from '@pages/profile';

import { APP_PATH } from '@shared/constants/constants';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path={APP_PATH.bonuses} element={<Bonuses />} />
          <Route path={APP_PATH.profile} element={<Profile />} />
          <Route path={APP_PATH.invite} element={<Invite />} />
          <Route path={APP_PATH.favorites} element={<Favorites />} />
          <Route path="*" element={<Navigate to={APP_PATH.main} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
