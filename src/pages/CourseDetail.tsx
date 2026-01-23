import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationStore, toSlug } from "@/stores/useNavigationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getProfileUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Info,
  Plus,
  Users,
  Edit,
  Trash2,
  ChevronDown,
  FileText,
  BookOpen,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CourseDetailData {
  course_id: string;
  course_name: string;
  teacher_id: string;
  teacher_firstname: string;
  teacher_lastname: string;
  sub_teacher_id?: string;
  sub_teacher_name?: string;
  course_description: string;
  course_invited_code: string;
  members: any[];
  assignments: any[];
  lectures: any[];
  created_date: string;
  last_modified_date: string;
}

const CourseDetail = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const {
    fetchCourseDetail,
    user,
    updateCourse,
    leaveCourse,
    deleteCourse,
    createAssignment,
    uploadLecture,
  } = useAuthStore();
  const {
    courseId,
    setCourseContext,
    setAssignmentContext,
    setLectureContext,
  } = useNavigationStore();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLectureOpen, setCreateLectureOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: "",
    description: "",
  });
  const [lectureFormData, setLectureFormData] = useState({
    title: "",
    description: "",
  });
  const [lectureFiles, setLectureFiles] = useState<File[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState("10:30:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId, courseSlug]);

  const loadCourseDetail = async () => {
    if (!courseId) return;
    const data = await fetchCourseDetail(courseId);
    setCourse(data);
    if (data) {
      setFormData({
        name: data.course_name,
        description: data.course_description,
      });
      // Update context with course name
      setCourseContext(data.course_id, data.course_name);
    }
  };

  const handleEdit = async () => {
    if (isEditing && courseId) {
      const success = await updateCourse(courseId, formData);
      if (success) {
        setIsEditing(false);
        await loadCourseDetail();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: course?.course_name || "",
      description: course?.course_description || "",
    });
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLeaveOrDelete = async () => {
    if (!courseId) return;
    const isOwner =
      user?.firstname === course?.teacher_firstname &&
      user?.lastname === course?.teacher_lastname;

    const confirmMessage =
      isOwner ?
        "Are you sure you want to delete this course? This action cannot be undone."
      : "Are you sure you want to leave this course?";

    if (!confirm(confirmMessage)) return;

    const success =
      isOwner ? await deleteCourse(courseId) : await leaveCourse(courseId);

    if (success) {
      navigate("/course");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    let submissionDateString = "";
    if (dueDate && dueTime) {
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, "0");
      const day = String(dueDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      submissionDateString = `${dateStr} ${dueTime}`;
    }

    const success = await createAssignment({
      ...assignmentFormData,
      courseId,
      submissionDate: submissionDateString || undefined,
    });

    if (success) {
      setCreateOpen(false);
      setAssignmentFormData({
        title: "",
        description: "",
      });
      setDueDate(undefined);
      setDueTime("10:30:00");
      await loadCourseDetail();
    }
  };

  const handleAssignmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setAssignmentFormData({
      ...assignmentFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLectureFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setLectureFormData({
      ...lectureFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLectureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Append new files to existing ones
      setLectureFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const handleRemoveLectureFile = (indexToRemove: number) => {
    setLectureFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    const formDataToSend = new FormData();
    formDataToSend.append("title", lectureFormData.title);
    formDataToSend.append("description", lectureFormData.description);

    // Append all files
    lectureFiles.forEach((file) => {
      formDataToSend.append("files", file);
    });
    console.log(formDataToSend)

    const success = await uploadLecture(courseId, formDataToSend);

    if (success) {
      setCreateLectureOpen(false);
      setLectureFormData({
        title: "",
        description: "",
      });
      setLectureFiles([]);
      await loadCourseDetail();
    }
  };

  const isTeacher =
    (user?.firstname === course?.teacher_firstname &&
      user?.lastname === course?.teacher_lastname) ||
    (course?.sub_teacher_name &&
      user?.firstname + " " + user?.lastname === course?.sub_teacher_name);

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{course.course_name}</h1>
          <p className="text-muted-foreground">{course.course_description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl bg-white hover:bg-gray-50"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Info className="mr-2 h-4 w-4" />
              Course Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMembersOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Members
            </DropdownMenuItem>
            {user?.firstname === course.teacher_firstname &&
              user?.lastname === course.teacher_lastname && (
                <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </DropdownMenuItem>
              )}
            {user?.firstname === course.teacher_firstname &&
              user?.lastname === course.teacher_lastname && (
                <DropdownMenuItem onClick={() => setCreateLectureOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Lecture
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Course Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Detailed information about {course.course_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing ?
              <Card>
                <CardHeader>
                  <CardTitle>Edit Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            : <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Course Name</p>
                    <p className="font-medium">{course.course_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Course Description
                    </p>
                    <p className="font-medium">{course.course_description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invite Code</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium">
                        {course.course_invited_code}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            course.course_invited_code,
                          );
                          setCopied(true);
                          toast.success("Invite code copied to clipboard!");
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {copied ?
                          <Check className="h-4 w-4 text-green-500" />
                        : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div
                    className={
                      course.last_modified_date ? "grid grid-cols-2 gap-4" : ""
                    }
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created Date
                      </p>
                      <p className="font-medium">
                        {new Date(course.created_date).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </div>
                    {course.last_modified_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Modified
                        </p>
                        <p className="font-medium">
                          {new Date(course.last_modified_date).toLocaleString(
                            "en-GB",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                            },
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            }

            <Card>
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Main Teacher
                    </p>
                    <Link
                      to={getProfileUrl(course.teacher_id, user?.id)}
                      className="font-medium text-primary hover:underline cursor-pointer"
                    >
                      {course.teacher_firstname} {course.teacher_lastname}
                    </Link>
                  </div>
                  {course.sub_teacher_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sub Teacher
                      </p>
                      <p className="font-medium">{course.sub_teacher_name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              {isTeacher &&
                (isEditing ?
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleEdit}>Save</Button>
                  </>
                : <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>)}
            </div>
            <Button variant="destructive" onClick={handleLeaveOrDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isTeacher ? "Delete Course" : "Leave Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog (for owner only) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for this course
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                name="title"
                value={assignmentFormData.title}
                onChange={handleAssignmentFormChange}
                placeholder="Enter assignment title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={assignmentFormData.description}
                onChange={handleAssignmentFormChange}
                placeholder="Enter assignment description"
                required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="px-1">Due Date (Optional)</Label>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-40 justify-between font-normal"
                      >
                        {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          setDatePickerOpen(false);
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    type="time"
                    step="1"
                    lang="en-GB"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Assignment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Lecture Dialog */}
      <Dialog open={createLectureOpen} onOpenChange={setCreateLectureOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Lecture</DialogTitle>
            <DialogDescription>
              Upload a new lecture file for this course
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLecture} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lectureTitle">Lecture Title *</Label>
              <Input
                id="lectureTitle"
                name="title"
                value={lectureFormData.title}
                onChange={handleLectureFormChange}
                placeholder="Enter lecture title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lectureDescription">Description *</Label>
              <textarea
                id="lectureDescription"
                name="description"
                value={lectureFormData.description}
                onChange={handleLectureFormChange}
                placeholder="Enter lecture description"
                required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lectureFile">Lecture Files (Optional)</Label>
              <Input
                id="lectureFile"
                type="file"
                onChange={handleLectureFileChange}
                multiple
                className="cursor-pointer"
              />
              {lectureFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Selected {lectureFiles.length} file(s):
                  </p>
                  <div className="space-y-1">
                    {lectureFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLectureFile(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateLectureOpen(false);
                  setLectureFormData({ title: "", description: "" });
                  setLectureFiles([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Upload Lecture</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Members ({course.members?.length || 0})</DialogTitle>
            <DialogDescription>
              All members in {course.course_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 overflow-y-auto">
            {course.members && course.members.length > 0 ?
              <div className="space-y-2">
                {course.members.map((member: any, index: number) => (
                  <div
                    key={member.id || index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      {member.memberId ?
                        <Link
                          to={getProfileUrl(member.memberId, user?.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {member.firstname + " " + member.lastname ||
                            "Unknown"}
                        </Link>
                      : <p className="font-medium">
                          {member.firstname + " " + member.lastname ||
                            "Unknown"}
                        </p>
                      }
                    </div>
                    {(
                      member.firstname === course.teacher_firstname &&
                      member.lastname === course.teacher_lastname
                    ) ?
                      <Badge variant="default">Owner</Badge>
                    : (
                      member.firstname + " " + member.lastname ===
                      course.sub_teacher_name
                    ) ?
                      <Badge variant="secondary">Sub Teacher</Badge>
                    : <Badge variant="outline">Member</Badge>}
                  </div>
                ))}
              </div>
            : <p className="text-muted-foreground text-center">
                No members yet
              </p>
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* Lectures List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Lectures ({course.lectures?.length || 0})
        </h2>
        {course.lectures && course.lectures.length > 0 ?
          <div className="space-y-3">
            {course.lectures.map((lecture: any) => (
              <div
                key={lecture.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  setLectureContext(lecture.id, lecture.title);
                  navigate(
                    `/course/${courseSlug}/lecture/${toSlug(lecture.title)}`,
                  );
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{lecture.title}</h3>
                </div>
              </div>
            ))}
          </div>
        : <p className="text-muted-foreground text-center py-8">
            No lectures yet
          </p>
        }
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Assignments ({course.assignments?.length || 0})
        </h2>
        {course.assignments && course.assignments.length > 0 ?
          <div className="space-y-3">
            {course.assignments.map((assignment: any) => (
              <div
                key={assignment.assignment_id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  setAssignmentContext(
                    assignment.assignment_id,
                    assignment.assignment_title,
                  );
                  navigate(
                    `/course/${courseSlug}/${toSlug(
                      assignment.assignment_title,
                    )}`,
                  );
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">
                    {assignment.assignment_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {assignment.assignment_description}
                  </p>
                  {assignment.submission_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Due:{" "}
                      {new Date(assignment.submission_date).toLocaleString(
                        "en-GB",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        },
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        : <p className="text-muted-foreground text-center py-8">
            No assignments yet
          </p>
        }
      </div>
    </div>
  );
};

export default CourseDetail;
