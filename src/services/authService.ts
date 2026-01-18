import api from "@/lib/axios";

export const authService = {
  signUp: async (
    firstname: string,
    lastname: string,
    email: string,
    role: string,
    password: string,
    confirmPassword: string,
  ) => {
    const response = await api.post(
      "/v1/identity/auth/register",
      {
        firstname,
        lastname,
        email,
        role,
        password,
        confirmPassword,
      },
      {
        withCredentials: true,
      },
    );
    return response;
  },

  logIn: async (email: string, password: string) => {
    const response = await api.post(
      "/v1/identity/auth/login",
      {
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );
    return response.data.access_token;
  },

  logOut: async () => {
    return api.post("/v1/identity/auth/logout", {}, { withCredentials: true });
  },

  refresh: async () => {
    const response = await api.post(
      "/v1/identity/auth/refresh",
      {},
      { withCredentials: true },
    );
    return response.data.access_token;
  },

  fetchMe: async () => {
    const response = await api.get("/v1/identity/me/", {
      withCredentials: true,
    });
    return response.data;
  },

  updateProfile: async (formData: {
    firstname: string;
    lastname: string;
    role: string;
  }) => {
    await api.patch("/v1/identity/me/", formData, {
      withCredentials: true,
    });
  },

  fetchUserById: async (userId: string) => {
    const response = await api.get(`/v1/identity/me/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    await api.post("/v1/identity/me/password", data, {
      withCredentials: true,
    });
  },

  deactivateAccount: async () => {
    await api.post(
      "/v1/identity/me/deactivate",
      {},
      {
        withCredentials: true,
      },
    );
  },

  reactivateAccount: async () => {
    await api.post(
      "/v1/identity/me/reactivate",
      {},
      {
        withCredentials: true,
      },
    );
  },

  deleteAccount: async () => {
    await api.delete("/v1/identity/me/delete", {
      withCredentials: true,
    });
  },

  fetchAllCourses: async () => {
    const response = await api.get("/v1/academic/courses/", {
      withCredentials: true,
    });
    return response.data;
  },

  createCourse: async (formData: {
    name: string;
    description: string;
    subTeacherId?: string | null;
    subTeacherName?: string | null;
  }) => {
    const response = await api.post("/v1/academic/courses/create", formData, {
      withCredentials: true,
    });
    return response.data;
  },

  joinCourse: async (code: string) => {
    await api.patch(
      `/v1/academic/courses/invite?code=${code}`,
      {},
      { withCredentials: true },
    );
  },

  fetchCourseDetail: async (courseId: string) => {
    const response = await api.get(`/v1/academic/courses/${courseId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  updateCourse: async (
    courseId: string,
    formData: {
      name: string;
      description: string;
    },
  ) => {
    await api.patch(`/v1/academic/courses/${courseId}`, formData, {
      withCredentials: true,
    });
  },

  leaveCourse: async (courseId: string) => {
    await api.patch(`/v1/academic/courses/${courseId}/leave`, {
      withCredentials: true,
    });
  },

  deleteCourse: async (courseId: string) => {
    await api.delete(`/v1/academic/courses/${courseId}`, {
      withCredentials: true,
    });
  },

  // Assignment methods
  createAssignment: async (formData: {
    title: string;
    description: string;
    courseId: string;
    submissionDate?: string;
  }) => {
    const response = await api.post(
      "/v1/grading/assignments/create",
      formData,
      { withCredentials: true },
    );
    return response.data;
  },

  updateAssignment: async (
    assignmentId: string,
    formData: {
      title: string;
      description: string;
      submissionDate?: string;
    },
  ) => {
    await api.patch(`/v1/grading/assignments/${assignmentId}`, formData, {
      withCredentials: true,
    });
  },

  getAssignmentById: async (assignmentId: string) => {
    const response = await api.get(`/v1/grading/assignments/${assignmentId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  getAssignmentsByCourseId: async (courseId: string) => {
    const response = await api.get(
      `/v1/grading/assignments/course/${courseId}`,
      { withCredentials: true },
    );
    return response.data;
  },

  deleteAssignment: async (assignmentId: string) => {
    await api.delete(`/v1/grading/assignments/${assignmentId}`, {
      withCredentials: true,
    });
  },

  // Lecture methods
  uploadLecture: async (courseId: string, formData: FormData) => {
    const response = await api.post(
      `/v1/grading/lectures/course/${courseId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  getLectureById: async (lectureId: string) => {
    const response = await api.get(`/v1/grading/lectures/${lectureId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  getLecturesByCourseId: async (courseId: string) => {
    const response = await api.get(`/v1/grading/lectures/course/${courseId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  downloadLectureFile: async (fileId: string) => {
    const response = await api.get(
      `/v1/grading/lectures/files/${fileId}/download`,
      {
        withCredentials: true,
        responseType: "blob",
      },
    );
    return response;
  },

  updateLecture: async (
    lectureId: string,
    data: { title?: string; description?: string },
  ) => {
    const response = await api.patch(
      `/v1/grading/lectures/${lectureId}`,
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  },

  addFilesToLecture: async (lectureId: string, formData: FormData) => {
    const response = await api.post(
      `/v1/grading/lectures/${lectureId}/files`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  deleteLectureFile: async (lectureId: string, fileId: string) => {
    const response = await api.delete(
      `/v1/grading/lectures/${lectureId}/files/${fileId}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  deleteLecture: async (lectureId: string) => {
    await api.delete(`/v1/grading/lectures/${lectureId}`, {
      withCredentials: true,
    });
  },

  // Submission methods
  submitAssignment: async (assignmentId: string, formData: FormData) => {
    const response = await api.post(
      `/v1/grading/assignments/${assignmentId}/submit`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  downloadSubmission: async (submissionId: string) => {
    const response = await api.get(
      `/v1/grading/assignments/submissions/${submissionId}/download`,
      {
        withCredentials: true,
        responseType: "blob",
      },
    );
    return response;
  },

  deleteSubmission: async (submissionId: string) => {
    await api.delete(`/v1/grading/assignments/submissions/${submissionId}`, {
      withCredentials: true,
    });
  },
};
