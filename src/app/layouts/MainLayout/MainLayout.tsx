import { Footer } from "@widgets/Footer";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Header, Sidebar, TabScreenMenu } from "../../../widgets";

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Header className={styles.headerLayout} />
      <Sidebar className={styles.sidebarLayout} />
      <main className={styles.layoutMain}>
        <div className={styles.layoutMainContainer}>
          <Outlet />
        </div>
          <Footer />
      </main>
      <TabScreenMenu className={styles.tabScreenMenu}/>
    </div>
  );
};
