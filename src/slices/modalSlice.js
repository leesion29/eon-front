import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  message: "",
  type: "success",
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (state, action) => {
      state.isOpen = true;
      if (typeof action.payload === "string") {
        state.message = action.payload;
        state.type = "success";
      } else {
        const { message, type } = action.payload;
        state.message = message;
        state.type = type || "success";
      }
    },
    hideModal: (state) => {
      state.isOpen = false;
      state.message = "";
      state.type = "success";
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;
