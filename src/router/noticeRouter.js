import { lazy, Suspense } from "react";
// import RoleGuard from "../components/RoleGuard";
import Loading from "../components/Loading";
import RoleGuard from "../components/RoleGuard";

const NoticeListPage = lazy(() => import("../pages/NoticeListPage"));
const NoticeDataPage = lazy(() => import("../pages/NoticeDataPage"));
const NoticeWritePage = lazy(() => import("../pages/Admin/AdminNoticeWritePage"))
const NoticeEditPage = lazy(() => import("../pages/Admin/AdminNoticeEditPage"))
const noticeRouter = [
  {
    path: "noticelist",
    element: (
      <Suspense fallback={<Loading />}>
        <NoticeListPage />
      </Suspense>
    ),
  },
  {
    path: "noticedata",
    element: (
      <Suspense fallback={<Loading />}>
        <NoticeDataPage />
      </Suspense>
    ),
  },
  {
    path: "noticewrite",
    element: (
      <RoleGuard allowedRoles={"ADMIN"}>
        <Suspense fallback={<Loading />}>
          <NoticeWritePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "noticeedit",
    element: (
      <RoleGuard allowedRoles={"ADMIN"}>
        <Suspense fallback={<Loading />}>
          <NoticeEditPage />
        </Suspense>
      </RoleGuard>
    ),
  },
];
export default noticeRouter;
