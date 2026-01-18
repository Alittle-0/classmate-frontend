import type { User, ChangePasswordData, UpdateProfileData } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean; // auth-related loading
  pageLoading: boolean; // course list / detail loading

  clearState: () => void;

  setAccessToken: (accessToken: string) => void;
  signUp: (
    firstname: string,
    lastname: string,
    email: string,
    role: string,
    password: string,
    confirmPassword: string,
  ) => Promise<boolean>;

  logIn: (email: string, password: string) => Promise<boolean>;

  logOut: () => Promise<void>;

  refresh: () => Promise<void>;

  fetchMe: () => Promise<void>;

  updateProfile: (formData: UpdateProfileData) => Promise<boolean>;

  fetchUserById: (userId: string) => Promise<User | null>;

  changePassword: (data: ChangePasswordData) => Promise<boolean>;

  deactivateAccount: () => Promise<boolean>;

  reactivateAccount: () => Promise<boolean>;

  deleteAccount: () => Promise<boolean>;

  fetchAllCourses: () => Promise<any[]>;

  createCourse: (formData: {
    name: string;
    description: string;
    subTeacherId?: string | null;
    subTeacherName?: string | null;
  }) => Promise<boolean>;

  joinCourse: (code: string) => Promise<boolean>;

  fetchCourseDetail: (courseId: string) => Promise<any>;

  updateCourse: (
    courseId: string,
    formData: {
      name: string;
      description: string;
    },
  ) => Promise<boolean>;

  leaveCourse: (courseId: string) => Promise<boolean>;

  deleteCourse: (courseId: string) => Promise<boolean>;

  // Assignment methods
  createAssignment: (formData: {
    title: string;
    description: string;
    courseId: string;
    submissionDate?: string;
  }) => Promise<boolean>;

  updateAssignment: (
    assignmentId: string,
    formData: {
      title: string;
      description: string;
      submissionDate?: string;
    },
  ) => Promise<boolean>;

  getAssignmentById: (assignmentId: string) => Promise<any>;

  getAssignmentsByCourseId: (courseId: string) => Promise<any[]>;

  deleteAssignment: (assignmentId: string) => Promise<boolean>;

  // Lecture methods
  uploadLecture: (courseId: string, formData: FormData) => Promise<boolean>;

  getLectureById: (lectureId: string) => Promise<any>;

  getLecturesByCourseId: (courseId: string) => Promise<any[]>;

  downloadLectureFile: (lectureId: string, fileName: string) => Promise<void>;

  updateLecture: (
    lectureId: string,
    data: { title?: string; description?: string },
  ) => Promise<boolean>;

  addFilesToLecture: (
    lectureId: string,
    formData: FormData,
  ) => Promise<boolean>;

  deleteLectureFile: (lectureId: string, fileId: string) => Promise<boolean>;

  deleteLecture: (lectureId: string) => Promise<boolean>;

  // Submission methods
  submitAssignment: (assignmentId: string, formData: FormData) => Promise<any>;

  downloadSubmission: (submissionId: string, fileName: string) => Promise<void>;

  deleteSubmission: (submissionId: string) => Promise<boolean>;
}
