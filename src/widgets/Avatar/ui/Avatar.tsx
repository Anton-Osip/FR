import { Avatar } from "radix-ui";
import "../Avatar.scss";

export const AppAvatar = () => {
  const avatarData = {
    src: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80",
    alt: "avatar",
    initials: "CT",
  };

  return (
    <Avatar.Root className="avatar-root">
      <Avatar.Image
        className="avatar-image"
        src={avatarData.src}
        alt={avatarData.alt}
      />
      <Avatar.Fallback className="avatar-fallback" delayMs={600}>
        {avatarData.initials}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};
