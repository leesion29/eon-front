import { useState, createContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";
import root from "../router/root";

// 전역 Context
export const AuthContext = createContext(null);
export const ModalContext = createContext({
  showModal: () => {},
  showConfirm: () => {},
});

function AppWrapper() {
  // Redux 상태 필드별 안전하게 구조분해
  const userId = useSelector((state) => state.login?.userId ?? null);
  const userEmail = useSelector((state) => state.login?.userEmail ?? null);
  const userRole = useSelector((state) => state.login?.userRole ?? null);
  const userName = useSelector((state) => state.login?.userName ?? null);
  const userPhone = useSelector((state) => state.login?.userPhone ?? null);
  const userImgUrl = useSelector((state) => state.login?.userImgUrl ?? null);
  const userBirth = useSelector((state) => state.login?.userBirth ?? null);
  const departmentId = useSelector((state) => state.login?.departmentId ?? null);
  const departmentName = useSelector((state) => state.login?.departmentName ?? null);


  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => {});

  const showModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  const showConfirm = ({ message, onConfirm }) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => () => {
      onConfirm?.();
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  const cancelConfirm = () => {
    setIsConfirmOpen(false);
    setConfirmMessage("");
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userEmail,
        userRole,
        userName,
        userPhone,
        userImgUrl,
        userBirth,
        departmentId,
        departmentName,
      }}
    >
      <ModalContext.Provider value={{ showModal, showConfirm }}>
        <div className="relative">
          <RouterProvider router={root} />
          <AlertModal
            isOpen={isModalOpen}
            message={modalMessage}
            onClose={closeModal}
          />
          <ConfirmModal
            isOpen={isConfirmOpen}
            message={confirmMessage}
            onConfirm={onConfirmAction}
            onCancel={cancelConfirm}
          />
        </div>
      </ModalContext.Provider>
    </AuthContext.Provider>
  );
}

export default AppWrapper;
