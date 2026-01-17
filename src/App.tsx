import { BrowserRouter, Routes, Route } from "react-router";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Getting from "./pages/Getting";
import Main from "./pages/Main";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Assignment from "./pages/Assignment";
import Lecture from "./pages/Lecture";
import Profile from "./pages/Profile";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SidebarLayout from "./components/layouts/SidebarLayout";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<LogIn />} />

          <Route path="/signup" element={<SignUp />} />

          <Route path="/getting" element={<Getting />} />

          {/* private routes with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/" element={<Main />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseSlug" element={<CourseDetail />} />
              <Route
                path="/course/:courseSlug/:assignmentSlug"
                element={<Assignment />}
              />
              <Route
                path="/course/:courseSlug/lecture/:lectureSlug"
                element={<Lecture />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
