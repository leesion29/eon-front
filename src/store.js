import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"; // ← 확인
import modalReducer from "./slices/modalSlice";
export default configureStore({
  reducer: { modal: modalReducer, auth: authReducer },
});
