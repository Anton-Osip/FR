import "./App.scss";
import {Route, BrowserRouter, Routes, Navigate} from "react-router-dom";
import {MainLayout} from "@app/layouts/MainLayout";
import {APP_PATH} from "@shared/constants/constants.ts";
import {HomePage} from "@pages/home";
import {Bonuses} from "@pages/bonuses";
import {Profile} from "@pages/profile";
import {Invite} from "@pages/invite";
import {Favorites} from "@pages/favorites";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path={APP_PATH.bonuses} element={<Bonuses/>}/>
                    <Route path={APP_PATH.profile} element={<Profile/>}/>
                    <Route path={APP_PATH.invite} element={<Invite/>}/>
                    <Route path={APP_PATH.favorites} element={<Favorites/>}/>
                    <Route path="*" element={<Navigate to={APP_PATH.main} replace />}/>
                </Route>
            </Routes>
        </BrowserRouter>);
}

export default App;
