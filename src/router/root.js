import { Navigate, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import BasicLayout from "../layouts/BasicLayout";
import memberRouter from "./memberRouter";
import studentRouter from "./studentRouter";
import adminRouter from "./adminRouter";
import professorRouter from "./professorRouter";
import qnaRouter from "./qnaRouter";
import noticeRouter from "./noticeRouter";
import Loading from "../components/Loading";

const MainPage = lazy(() => import("../pages/MainPage"));
const CalenderPage = lazy(() => import("../pages/CalenderPage"));
const ProfilePage = lazy(() => import("../pages/users/ProfilePage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));
const PeriodExpiredPage = lazy(() =>
  import("../pages/users/PeriodExpiredPage")
);
const ResetPasswordPage = lazy(() =>
  import("../pages/users/ResetPasswordPage")
);

const root = createBrowserRouter([
  { path: "/", element: <Navigate to="/member/login" /> },
  {
    path: "/main",
    element: <BasicLayout />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<Loading />}>
            <MainPage />
          </Suspense>
        ),
      },
      {
        path: "calender",
        element: (
          <Suspense fallback={<Loading />}>
            <CalenderPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      ...studentRouter,
      ...adminRouter,
      ...professorRouter,
      ...qnaRouter,
      ...noticeRouter,
      {
        path: "unauthorized",
        element: (
          <Suspense fallback={<Loading />}>
            <UnauthorizedPage />
          </Suspense>
        ),
      },
      {
        path: "period-expired",
        element: (
          <Suspense fallback={<Loading />}>
            <PeriodExpiredPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/member",
    children: memberRouter(),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<Loading />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "calender",
    element: (
      <Suspense fallback={<Loading />}>
        <CalenderPage />
      </Suspense>
    ),
  },
]);

export default root;
