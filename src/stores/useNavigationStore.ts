import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavigationContext {
  courseId: string | null;
  courseName: string | null;
  assignmentId: string | null;
  assignmentTitle: string | null;
  lectureId: string | null;
  lectureTitle: string | null;
  viewedProfileName: string | null;
}

interface NavigationState extends NavigationContext {
  setCourseContext: (courseId: string, courseName: string) => void;
  setAssignmentContext: (assignmentId: string, assignmentTitle: string) => void;
  setLectureContext: (lectureId: string, lectureTitle: string) => void;
  setViewedProfileName: (name: string | null) => void;
  clearContext: () => void;
}

// Utility function to convert text to URL slug
export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove non-word chars except -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .trim();
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      courseId: null,
      courseName: null,
      assignmentId: null,
      assignmentTitle: null,
      lectureId: null,
      lectureTitle: null,
      viewedProfileName: null,

      setCourseContext: (courseId, courseName) => {
        set({ courseId, courseName });
      },

      setAssignmentContext: (assignmentId, assignmentTitle) => {
        set({ assignmentId, assignmentTitle });
      },

      setLectureContext: (lectureId, lectureTitle) => {
        set({ lectureId, lectureTitle });
      },

      setViewedProfileName: (name) => {
        set({ viewedProfileName: name });
      },

      clearContext: () => {
        set({
          courseId: null,
          courseName: null,
          assignmentId: null,
          assignmentTitle: null,
          lectureId: null,
          lectureTitle: null,
          viewedProfileName: null,
        });
      },
    }),
    {
      name: "navigation-context", // localStorage key
    },
  ),
);
