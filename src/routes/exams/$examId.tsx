import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/exams/$examId")({ component: ExamLayout });

function ExamLayout() {
  return <Outlet />;
}
