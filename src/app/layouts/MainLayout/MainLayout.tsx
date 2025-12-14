import { Header } from "@widgets/Header";
import { Footer } from "@widgets/Footer";
import { Sidebar } from "@widgets/Sidebar";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss";

export const MainLayout = () => {
  return (
    <div className={styles["layout"]}>
      <Header />
      <Sidebar />
      <main className={styles["layout-main"]}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
