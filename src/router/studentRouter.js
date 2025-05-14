// 📁 src/routers/studentRouter.js
import { lazy, Suspense } from "react";
import RoleGuard from "../components/RoleGuard";
import Loading from "../components/Loading";


const GradePage = lazy(() => import("../pages/GradePage"));
const AllGradePage = lazy(() => import("../pages/AllGradePage"));
const EnrollmentPage = lazy(() => import("../pages/EnrollmentPage"));
const HistoryPage = lazy(() => import("../pages/HistoryPage"));
const SchedulePage = lazy(() => import("../pages/SchedulePage"));
const ChangepwPage = lazy(() => import("../components/ChangepwPage"));
const EvaluationPage = lazy(() => import("../pages/EvaluationPage"));
const EvaluationListPage = lazy(() => import("../pages/EvaluationListPage"));
const LeaveReturnPage = lazy(() => import("../pages/LeaveReturnPage"));
const studentRouter = [
  {
    path: "grades",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <GradePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "allgrades",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <AllGradePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "enrollment",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <EnrollmentPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "history",
    element: (
      <Suspense fallback={<Loading />}>
        <HistoryPage />
      </Suspense>
    ),
  },
  {
    path: "schedule",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <SchedulePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "password",
    element: <ChangepwPage />,
  },
  {
    path: "evaluationlist",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <EvaluationListPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "evaluation",
    element: (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <Suspense fallback={<Loading />}>
          <EvaluationPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "LeaveReturn",
    element: (
      <Suspense fallback={<Loading />}>
        <LeaveReturnPage />
      </Suspense>
    ),
  },
];

export default studentRouter;
