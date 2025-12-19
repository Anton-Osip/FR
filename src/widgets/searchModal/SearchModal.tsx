import { Modal} from "@shared/ui";
import type {FC, ReactNode} from "react";

interface SearchModalProps {
    trigger:ReactNode;
}

export const SearchModal:FC<SearchModalProps> = ({trigger}) => {
    return (
        <Modal
            trigger={trigger}
            title="Заголовок"
        >
            <div>SearchModal</div>
        </Modal>
    )
}