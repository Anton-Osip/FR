import { Footer } from "@widgets/Footer";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import {Header, Sidebar} from "../../../widgets";

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
        <Header className={styles.headerLayout}/>
        <Sidebar className={styles.sidebarLayout}/>
      <main className={styles["layout-main"]}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
