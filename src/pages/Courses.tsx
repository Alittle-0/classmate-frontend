import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationStore, toSlug } from "@/stores/useNavigationStore";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { getProfileUrl } from "@/lib/utils";

interface Course {
  course_id: string;
  course_name: string;
  teacher_id: string;
  teacher_firstname: string;
  teacher_lastname: string;
  sub_teacher_id?: string;
  sub_teacher_name?: string;
}

const Course = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchAllCourses = useAuthStore((s) => s.fetchAllCourses);
  const createCourse = useAuthStore((s) => s.createCourse);
  const joinCourse = useAuthStore((s) => s.joinCourse);
  const { setCourseContext } = useNavigationStore();
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subTeacherId: "",
    subTeacherName: "",
  });
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      const data = await fetchAllCourses();
      setCourses(data);
    };
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCourses = async () => {
    const data = await fetchAllCourses();
    setCourses(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      subTeacherId: formData.subTeacherId || null,
      subTeacherName: formData.subTeacherName || null,
    };

    const success = await createCourse(payload);
    if (success) {
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        subTeacherId: "",
        subTeacherName: "",
      });
      await loadCourses();
    }
  };

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await joinCourse(joinCode);
    if (success) {
      setJoinOpen(false);
      setJoinCode("");
      await loadCourses();
    }
  };

  const handleCourseClick = (courseId: string, courseName: string) => {
    setCourseContext(courseId, courseName);
    navigate(`/course/${toSlug(courseName)}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Join Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join Course</DialogTitle>
                <DialogDescription>
                  Enter the course code to join an existing course.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinCourse} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Course Code *</Label>
                  <Input
                    id="joinCode"
                    name="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter course code"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setJoinOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Join Course</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your curriculum. Fill in the course
                  details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Introduction to Microservice"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Learn how to build scalable microservices with Spring Boot"
                    required
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subTeacherId">Sub Teacher ID</Label>
                  <Input
                    id="subTeacherId"
                    name="subTeacherId"
                    value={formData.subTeacherId}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subTeacherName">Sub Teacher Name</Label>
                  <Input
                    id="subTeacherName"
                    name="subTeacherName"
                    value={formData.subTeacherName}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ?
        <p className="text-muted-foreground text-center py-12">
          No courses found. Create or join a course to get started.
        </p>
      : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.course_id}
              onClick={() =>
                handleCourseClick(course.course_id, course.course_name)
              }
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2 hover:text-primary">
                {course.course_name}
              </h3>
              <div className="text-muted-foreground text-sm">
                <span>Teacher: </span>
                <Link
                  to={getProfileUrl(course.teacher_id, user?.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  {course.teacher_firstname} {course.teacher_lastname}
                </Link>
              </div>
              {course.sub_teacher_id && (
                <div className="text-xs text-muted-foreground mt-3">
                  <span>Sub Teacher: </span>
                  <span className="font-medium">{course.sub_teacher_name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Course;
