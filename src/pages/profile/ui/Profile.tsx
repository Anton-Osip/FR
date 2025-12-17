import { Breadcrumbs } from "@shared/ui/breadcrumbs";
import styles from "../Profile.module.scss";

const breadCrumbsItems = [{ label: "Профиль" }];

export const Profile = () => {
  return (
    <>
      <Breadcrumbs items={breadCrumbsItems} />
      Profile Page
    </>
  );
};
