import { useSelector, useDispatch } from "react-redux";
import AlertModal from "./AlertModal";
import { hideModal } from "../slices/modalSlice";

const GlobalModalManager = () => {
  const dispatch = useDispatch();
  const { isOpen, message, type } = useSelector((state) => state.modal);

  return (
    <AlertModal
      isOpen={isOpen}
      message={message}
      type={type}
      onClose={() => dispatch(hideModal())}
    />
  );
};

export default GlobalModalManager;
