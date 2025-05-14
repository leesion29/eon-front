// hooks/useModal.js
import { useDispatch, useSelector } from "react-redux";
import { showModal, hideModal } from "../slices/modalSlice";

export const useModal = () => {
  const dispatch = useDispatch();
  const { isOpen, message } = useSelector((state) => state.modal);

  const openModal = (msg) => dispatch(showModal(msg));
  const closeModal = () => dispatch(hideModal());

  return {
    isOpen,
    message,
    openModal,
    closeModal,
  };
};
