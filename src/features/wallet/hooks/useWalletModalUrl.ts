import { useSearchParams } from 'react-router-dom';

const WALLET_MODAL_PARAM = 'modal';
const WALLET_MODAL_VALUE = 'wallet';

export function useWalletModalUrl(): {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.get(WALLET_MODAL_PARAM) === WALLET_MODAL_VALUE;

  const openModal = (): void => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);

        next.set(WALLET_MODAL_PARAM, WALLET_MODAL_VALUE);

        return next;
      },
      { replace: true },
    );
  };

  const closeModal = (): void => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);

        next.delete(WALLET_MODAL_PARAM);

        return next;
      },
      { replace: true },
    );
  };

  return { isOpen, openModal, closeModal };
}
