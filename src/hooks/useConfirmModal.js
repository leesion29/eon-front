import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  const openConfirm = (msg, confirmCallback) => {
    setMessage(msg);
    setOnConfirm(() => async () => {
      await confirmCallback();
      setIsOpen(false);
    });
    setIsOpen(true);
  };

  const ConfirmModalComponent = (
    <ConfirmModal
      isOpen={isOpen}
      message={message}
      onConfirm={onConfirm}
      onCancel={() => setIsOpen(false)}
    />
  );

  return { openConfirm, ConfirmModalComponent };
};

export default useConfirmModal;