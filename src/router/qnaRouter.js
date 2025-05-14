// 📁 src/routers/qnaRouter.js
import { lazy, Suspense } from "react";
import RoleGuard from "../components/RoleGuard";
import Loading from "../components/Loading";

const QnaListPage = lazy(() => import("../pages/QnaListPage"));
const QnaDataPage = lazy(() => import("../pages/QnaDataPage"));
const QnaWritePage = lazy(() => import("../pages/QnaWritePage"));
const QnaEditPage = lazy(() => import("../pages/QnaEditPage"));

const qnaRouter = [
  {
    path: "qnalist",
    element: (
      <Suspense fallback={<Loading />}>
        <QnaListPage />
      </Suspense>
    ),
  },
  {
    path: "qnadata",
    element: (
      <Suspense fallback={<Loading />}>
        <QnaDataPage />
      </Suspense>
    ),
  },
  {
    path: "qnawrite",
    element: (
      <RoleGuard allowedRoles={["STUDENT", "PROFESSOR"]}>
        <Suspense fallback={<Loading />}>
          <QnaWritePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "qnaedit",
    element: (
      <Suspense fallback={<Loading />}>
        <QnaEditPage />
      </Suspense>
    ),
  },
];

export default qnaRouter;
