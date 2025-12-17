import { Footer } from "@widgets/Footer";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Header, Sidebar, TabScreenMenu } from "../../../widgets";
import { Button } from "@shared/ui/button";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";

export const MainLayout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setShowScrollTop(mainElement.scrollTop > 300);
    };

    mainElement.addEventListener("scroll", handleScroll);
    handleScroll(); // Проверяем начальное состояние

    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.layout}>
      <Header className={styles.headerLayout} />
      <Sidebar className={styles.sidebarLayout} />
      <main ref={mainRef} className={styles.layoutMain}>
        <div className={styles.layoutMainContainer}>
          <Outlet />
        </div>
          <Footer />
      </main>
      <TabScreenMenu className={styles.tabScreenMenu}/>
      {showScrollTop && (
        <Button
          variant="secondary"
          square
          icon={ChevronUpIcon}
          onClick={scrollToTop}
          className={styles.scrollTopButton}
          aria-label="Прокрутить вверх"
        />
      )}
    </div>
  );
};
