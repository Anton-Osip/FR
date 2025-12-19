import * as Dialog from "@radix-ui/react-dialog";
import {type ReactNode} from "react";
import styles from "./Modal.module.scss";
import {Button} from "../button";
import {CrossIcon} from "@shared/ui/icons";

export interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    trigger?: ReactNode;
    showCloseButton?: boolean;
    contentClassName?: string;
    overlayClassName?: string;
}

export const Modal = ({
                          open,
                          onOpenChange,
                          title,
                          description,
                          children,
                          trigger,
                          showCloseButton = true,
                          contentClassName,
                          overlayClassName,
                      }: ModalProps) => {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            )}
            <Dialog.Portal>
                <Dialog.Overlay
                    className={`${styles.overlay} ${overlayClassName || ""}`}
                />
                <Dialog.Content
                    className={`${styles.content} ${contentClassName || ""}`}
                >
                    {(title || description) && (
                        <div className={styles.header}>
                            {title && (
                                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                            )}
                            {showCloseButton && (
                                <Dialog.Close asChild>
                                    <Button
                                        variant="secondary"
                                        className={styles.closeButton}
                                        size={'s'}
                                        aria-label="Закрыть"
                                    >
                                        <CrossIcon/>
                                    </Button>
                                </Dialog.Close>
                            )}
                        </div>
                    )}
                    <Dialog.Description className={styles.description} hidden={!description}>
                        {description || ""}
                    </Dialog.Description>
                    <div className={styles.body}>{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

Modal.displayName = "Modal";

