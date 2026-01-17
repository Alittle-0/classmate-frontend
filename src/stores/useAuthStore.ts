import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  pageLoading: false,

  clearState: () => {
    set({
      accessToken: null,
      user: null,
      loading: false,
      pageLoading: false,
    });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  signUp: async (
    firstname,
    lastname,
    email,
    role,
    password,
    confirmPassword,
  ) => {
    try {
      set({ loading: true });

      await authService.signUp(
        firstname,
        lastname,
        email,
        role,
        password,
        confirmPassword,
      );

      toast.success("Create successfully! Navigate to login page.");
      return true;
    } catch (error) {
      console.error(error.response.data.message);
      toast.error("Error when creating: " + error.response.data.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logIn: async (email, password) => {
    try {
      set({ loading: true });

      const accessToken = await authService.logIn(email, password);
      get().setAccessToken(accessToken);

      await get().fetchMe();

      toast.success("Welcome to ClassMate!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error when logging in: " + error.response.data.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logOut: async () => {
    try {
      get().clearState();
      await authService.logOut();
      toast.success("Logout successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error occur during logging out! Try again in few minutes");
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();

      const accessToken = await authService.refresh();
      setAccessToken(accessToken);
      if (!user) {
        await fetchMe();
      }

      toast.success("Welcome back to ClassMate.");
    } catch (error) {
      console.error(error);
      //get().clearState();
      toast.error("Your login session has expired. Please login again");
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error("Cannot fetch your information. Please fetch again");
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ loading: true });
      await authService.updateProfile(formData);
      await get().fetchMe();

      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Cannot update your information. Please try again.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserById: async (userId) => {
    try {
      set({ pageLoading: true });
      const user = await authService.fetchUserById(userId);
      return user;
    } catch (error) {
      console.error(error);
      toast.error("User not found");
      return null;
    } finally {
      set({ pageLoading: false });
    }
  },

  changePassword: async (data) => {
    try {
      set({ loading: true });
      await authService.changePassword(data);
      toast.success("Password changed successfully!");
      return true;
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deactivateAccount: async () => {
    try {
      set({ loading: true });
      await authService.deactivateAccount();
      await get().fetchMe();
      toast.success("Account deactivated successfully");
      return true;
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Failed to deactivate account";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  reactivateAccount: async () => {
    try {
      set({ loading: true });
      await authService.reactivateAccount();
      await get().fetchMe();
      toast.success("Account reactivated successfully");
      return true;
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Failed to reactivate account";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    try {
      set({ loading: true });
      await authService.deleteAccount();
      get().clearState();
      toast.success("Account deleted successfully");
      return true;
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchAllCourses: async () => {
    try {
      set({ pageLoading: true });
      const courses = await authService.fetchAllCourses();
      return courses;
    } catch (error) {
      console.error(error);
      toast.error("There is no course available");
      return [];
    } finally {
      set({ pageLoading: false });
    }
  },

  createCourse: async (formData) => {
    try {
      set({ loading: true });
      await authService.createCourse(formData);
      toast.success("Course created successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to create course");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  joinCourse: async (code) => {
    try {
      set({ loading: true });
      await authService.joinCourse(code);
      toast.success("Joined course successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to join course");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchCourseDetail: async (courseId) => {
    try {
      set({ pageLoading: true });
      const course = await authService.fetchCourseDetail(courseId);
      return course;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course details");
      return null;
    } finally {
      set({ pageLoading: false });
    }
  },

  updateCourse: async (courseId, formData) => {
    try {
      set({ pageLoading: true });
      await authService.updateCourse(courseId, formData);
      toast.success("Course updated successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update course");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  leaveCourse: async (courseId) => {
    try {
      set({ pageLoading: true });
      await authService.leaveCourse(courseId);
      toast.success("Left course successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to leave course");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  deleteCourse: async (courseId) => {
    try {
      set({ pageLoading: true });
      await authService.deleteCourse(courseId);
      toast.success("Course deleted successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  // Assignment methods
  createAssignment: async (formData) => {
    try {
      set({ pageLoading: true });
      await authService.createAssignment(formData);
      toast.success("Assignment created successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to create assignment");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  updateAssignment: async (assignmentId, formData) => {
    try {
      set({ pageLoading: true });
      await authService.updateAssignment(assignmentId, formData);
      toast.success("Assignment updated successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update assignment");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  getAssignmentById: async (assignmentId) => {
    try {
      set({ pageLoading: true });
      const assignment = await authService.getAssignmentById(assignmentId);
      return assignment;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignment details");
      return null;
    } finally {
      set({ pageLoading: false });
    }
  },

  getAssignmentsByCourseId: async (courseId) => {
    try {
      set({ pageLoading: true });
      const assignments = await authService.getAssignmentsByCourseId(courseId);
      return assignments;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
      return [];
    } finally {
      set({ pageLoading: false });
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      set({ pageLoading: true });
      await authService.deleteAssignment(assignmentId);
      toast.success("Assignment deleted successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete assignment");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  // Lecture methods
  uploadLecture: async (courseId, formData) => {
    try {
      set({ pageLoading: true });
      await authService.uploadLecture(courseId, formData);
      toast.success("Lecture uploaded successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload lecture");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  getLectureById: async (lectureId) => {
    try {
      set({ pageLoading: true });
      const lecture = await authService.getLectureById(lectureId);
      return lecture;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load lecture details");
      return null;
    } finally {
      set({ pageLoading: false });
    }
  },

  getLecturesByCourseId: async (courseId) => {
    try {
      set({ pageLoading: true });
      const lectures = await authService.getLecturesByCourseId(courseId);
      return lectures;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load lectures");
      return [];
    } finally {
      set({ pageLoading: false });
    }
  },

  downloadLectureFile: async (fileId, fileName) => {
    try {
      const response = await authService.downloadLectureFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file");
    }
  },

  updateLecture: async (lectureId, data) => {
    try {
      set({ pageLoading: true });
      await authService.updateLecture(lectureId, data);
      toast.success("Lecture updated successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update lecture");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  addFilesToLecture: async (lectureId, formData) => {
    try {
      set({ pageLoading: true });
      await authService.addFilesToLecture(lectureId, formData);
      toast.success("Files added successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to add files");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  deleteLectureFile: async (lectureId, fileId) => {
    try {
      set({ pageLoading: true });
      await authService.deleteLectureFile(lectureId, fileId);
      toast.success("File deleted successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  deleteLecture: async (lectureId) => {
    try {
      set({ pageLoading: true });
      await authService.deleteLecture(lectureId);
      toast.success("Lecture deleted successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete lecture");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },

  // Submission methods
  submitAssignment: async (assignmentId, formData) => {
    try {
      set({ pageLoading: true });
      const result = await authService.submitAssignment(assignmentId, formData);
      toast.success("Assignment submitted successfully!");
      return result;
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit assignment");
      return null;
    } finally {
      set({ pageLoading: false });
    }
  },

  downloadSubmission: async (submissionId, fileName) => {
    try {
      const response = await authService.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download submission");
    }
  },

  deleteSubmission: async (submissionId) => {
    try {
      set({ pageLoading: true });
      await authService.deleteSubmission(submissionId);
      toast.success("Submission deleted successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete submission");
      return false;
    } finally {
      set({ pageLoading: false });
    }
  },
}));
