import { UserBalance } from "./UserBalance";
import { UserInfo } from "./UserInfo";
import styles from "./UserProfileInfo.module.scss";

const mockUser = {
  id: "904014",
  username: "Username",
  balance: "25.1",
};

export const UserProfileInfo = () => {
  return (
    <div className={styles.userInfo}>
      <UserInfo user={mockUser}/>
      <UserBalance isMain amount={1000584} />
      <UserBalance isMain={false} amount={50265} />
    </div>
  );
};
