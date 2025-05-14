import { lazy, Suspense } from "react";
import RoleGuard from "../components/RoleGuard";
import Loading from "../components/Loading";

const AdminUserListPage = lazy(() => import("../pages/Admin/AdminUserListPage"));
const AdminSchedulePage = lazy(() => import("../pages/Admin/AdminSchedulePage"));
const AdminGradePage = lazy(() => import("../pages/Admin/AdminGradePage")); 
const AdminLectureRoomPage = lazy(() => import("../pages/Admin/AdminLectureRoomPage"));
const AdminBuildingPage = lazy(() => import("../pages/Admin/AdminBuildingPage"));
const AdminDeparmentPage = lazy(() => import("../pages/Admin/AdminDepartmentPage"));
const AdminCoursePage = lazy(() => import("../pages/Admin/AdminCoursePage"));
const AdminLeavePage = lazy(() => import("../pages/Admin/AdminLeavePage"));
const AdminReturnPage = lazy(() => import("../pages/Admin/AdminReturnPage"));

const adminRouter = [
  {
    path: "admin/user-list",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminUserListPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/users",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminSchedulePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/grades", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminGradePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/lecture-rooms",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminLectureRoomPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/buildings",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminBuildingPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/departments",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminDeparmentPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/courses",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminCoursePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/leave",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminLeavePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "admin/return",
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Suspense fallback={<Loading />}>
          <AdminReturnPage />
        </Suspense>
      </RoleGuard>
    ),
  },

];

export default adminRouter;