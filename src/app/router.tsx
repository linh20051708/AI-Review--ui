import { createBrowserRouter, Navigate } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import MobileAppLayout from "@/layouts/MobileAppLayout"
import StudentAppLayout from "@/layouts/StudentAppLayout"
import LoginPage from "@/pages/auth/LoginPage"
import ClassDetailPage from "@/pages/classes/ClassDetailPage"
import ClassListPage from "@/pages/classes/ClassListPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import ProjectDocumentsPage from "@/pages/documents/ProjectDocumentsPage"
import NotificationsPage from "@/pages/notifications/NotificationsPage"
import ProfilePage from "@/pages/profile/ProfilePage"
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage"
import ProjectListPage from "@/pages/projects/ProjectListPage"
import AIReviewResultPage from "@/pages/reviews/AIReviewResultPage"
import ReviewHistoryPage from "@/pages/reviews/ReviewHistoryPage"
import ReviewRequestsPage from "@/pages/reviews/ReviewRequestsPage"
import ReviewWorkspacePage from "@/pages/reviews/ReviewWorkspacePage"
import VersionHistoryPage from "@/pages/reviews/VersionHistoryPage"
import ReviewHistoryIndexPage from "@/pages/reviews/ReviewHistoryIndexPage"
import DocumentListPage from "@/pages/documents/DocumentListPage"
import GroupDetailPage from "@/pages/groups/GroupDetailPage"
import GroupListPage from "@/pages/groups/GroupListPage"
import SemesterListPage from "@/pages/semesters/SemesterListPage"
import RuleSetListPage from "@/pages/semesters/RuleSetListPage"
import CourseListPage from "@/pages/semesters/CourseListPage"
import CourseOfferingDetailPage from "@/pages/semesters/CourseOfferingDetailPage"
import StudentListPage from "@/pages/students/StudentListPage"
import StudentDashboardPage from "@/pages/student/StudentDashboardPage"
import StudentProjectDetailPage from "@/pages/student/StudentProjectDetailPage"
import StudentDocumentsPage from "@/pages/student/StudentDocumentsPage"
import StudentDocumentDetailPage from "@/pages/student/StudentDocumentDetailPage"
import StudentUploadPage from "@/pages/student/StudentUploadPage"
import StudentVersionsPage from "@/pages/student/StudentVersionsPage"
import StudentNotificationsPage from "@/pages/student/StudentNotificationsPage"
import StudentProfilePage from "@/pages/student/StudentProfilePage"

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  {
    path: "/",
    element: <MobileAppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "classes", element: <ClassListPage /> },
      { path: "classes/:classId", element: <ClassDetailPage /> },
      { path: "projects", element: <ProjectListPage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "projects/:projectId/documents", element: <ProjectDocumentsPage /> },
      { path: "reviews", element: <ReviewRequestsPage /> },
      { path: "reviews/:reviewId", element: <ReviewWorkspacePage />, handle: { wide: true } },
      { path: "reviews/:reviewId/ai-result", element: <AIReviewResultPage /> },
      { path: "reviews/:reviewId/versions", element: <VersionHistoryPage /> },
      { path: "reviews/:reviewId/history", element: <ReviewHistoryPage /> },
      { path: "review-history", element: <ReviewHistoryIndexPage /> },
      { path: "documents", element: <DocumentListPage /> },
      { path: "groups", element: <GroupListPage /> },
      { path: "groups/:groupId", element: <GroupDetailPage /> },
      { path: "semesters", element: <SemesterListPage /> },
      { path: "rule-sets", element: <RuleSetListPage /> },
      { path: "courses", element: <CourseListPage /> },
      { path: "course-offerings/:offeringId", element: <CourseOfferingDetailPage /> },
      { path: "students", element: <StudentListPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: "/student",
    element: <StudentAppLayout />,
    children: [
      { index: true, element: <Navigate to="/student/dashboard" replace /> },
      { path: "dashboard", element: <StudentDashboardPage /> },
      { path: "projects/:projectId?", element: <StudentProjectDetailPage /> },
      { path: "documents", element: <StudentDocumentsPage /> },
      { path: "documents/:documentId", element: <StudentDocumentDetailPage /> },
      { path: "documents/:documentId/upload", element: <StudentUploadPage /> },
      { path: "documents/:documentId/versions", element: <StudentVersionsPage /> },
      { path: "notifications", element: <StudentNotificationsPage /> },
      { path: "profile", element: <StudentProfilePage /> },
      { path: "*", element: <Navigate to="/student/dashboard" replace /> },
    ],
  },
])
