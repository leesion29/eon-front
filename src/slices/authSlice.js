// slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, removeCookie } from "../util/cookieUtil";
import { loginPost } from "../api/memberApi";

// 비동기 로그인 thunk
export const loginPostAsync = createAsyncThunk(
  "auth/loginPostAsync",
  async (param, thunkAPI) => {
    try {
      const response = await loginPost(param);
      // accessToken 저장
      const token = response.accessToken;
      if (token) {
        localStorage.setItem("accessToken", token);
      }
      if (response.error) throw new Error(response.error);

      const user = response.userDTO;
      setCookie("member", JSON.stringify(user), 1); // 쿠키 저장
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const parseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

const loadInitialState = () => {
  const raw = getCookie("member");
  const parsed = typeof raw === "string" ? parseJSON(raw) : raw;

  if (parsed?.userId && parsed?.userRole) {
    return { userId: parsed.userId, userRole: parsed.userRole };
  }

  removeCookie("member");
  return { userId: null, userRole: null };
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    login: (state, action) => {
      state.userId = action.payload.userId;
      state.userRole = action.payload.userRole;
    },
    logout: (state) => {
      removeCookie("member");
      localStorage.removeItem("accessToken"); // 토큰 제거
      state.userId = null;
      state.userRole = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginPostAsync.fulfilled, (state, action) => {
      const user = action.payload;
      state.userId = user.userId;
      state.userRole = user.userRole;
    });
  },
});

export const { logout, login, setUserId } = authSlice.actions;
export default authSlice.reducer;
