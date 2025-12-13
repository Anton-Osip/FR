import * as RadixAvatar from "@radix-ui/react-avatar";
import styles from "./Avatar.module.scss";

export const Avatar = () => {
    const avatarData = {
        src: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80",
        alt: "avatar",
        initials: "CT",
    };

    return (
        <RadixAvatar.Root className = {styles.avatarRoot}>
            <RadixAvatar.Image
                className = {styles.avatarImage}
                src = {avatarData.src}
                alt = {avatarData.alt}
            />
            <RadixAvatar.Fallback className = {styles.avatarFallback} delayMs = {600}>
                {avatarData.initials}
            </RadixAvatar.Fallback>
        </RadixAvatar.Root>
    );
};
