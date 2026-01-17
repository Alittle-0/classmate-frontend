import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationStore, toSlug } from "@/stores/useNavigationStore";
import { getProfileUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Upload,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  firstname?: string;
  lastname?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  submittedDate: string;
  status: "SUBMITTED" | "LATE" | "GRADED";
  grade?: number;
  feedback?: string;
  createdDate: string;
  lastModifiedDate?: string;
}

const Assignment = () => {
  const { courseSlug: _courseSlug, assignmentSlug: _assignmentSlug } =
    useParams<{
      courseSlug: string;
      assignmentSlug: string;
    }>();
  const navigate = useNavigate();
  const { courseId, assignmentId } = useNavigationStore();
  const {
    getAssignmentById,
    fetchCourseDetail,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    downloadSubmission,
    deleteSubmission,
    user,
  } = useAuthStore();

  const [assignment, setAssignment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState("10:30:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssignmentDetail = async () => {
    if (!assignmentId) return;
    const data = await getAssignmentById(assignmentId);
    setAssignment(data);
    if (data) {
      setFormData({
        title: data.assignment_title || "",
        description: data.assignment_description || "",
      });

      if (data.submission_date) {
        const dateObj = new Date(data.submission_date);
        setDueDate(dateObj);
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        const seconds = dateObj.getSeconds().toString().padStart(2, "0");
        setDueTime(`${hours}:${minutes}:${seconds}`);
      }
    }
  };

  const loadCourseDetail = async () => {
    if (!courseId) return;
    const data = await fetchCourseDetail(courseId);
    setCourse(data);
  };

  useEffect(() => {
    loadAssignmentDetail();
    loadCourseDetail();
  }, [assignmentId, courseId]);

  const isTeacher = useMemo(() => {
    if (!user) return false;
    const fullName = user.firstname + " " + user.lastname;

    // Check from course data
    if (course) {
      if (
        fullName === course.teacher_name ||
        fullName === course.sub_teacher_name
      ) {
        return true;
      }
    }

    // Fallback: check if user created the assignment
    if (assignment && assignment.create_by === user._id) {
      return true;
    }

    // Also check user role
    if (user.role === "TEACHER") {
      return true;
    }

    return false;
  }, [course, user, assignment]);

  const deadlineInfo = useMemo(() => {
    if (!assignment?.submission_date) {
      return { hasDeadline: false };
    }

    const deadline = new Date(assignment.submission_date);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const isPastDeadline = diff < 0;

    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = "";
    if (days > 0) timeString += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) timeString += `${hours} hour${hours > 1 ? "s" : ""} `;
    if (minutes > 0 && days === 0)
      timeString += `${minutes} minute${minutes > 1 ? "s" : ""}`;

    return {
      hasDeadline: true,
      isPastDeadline,
      timeString: timeString.trim(),
      deadline,
    };
  }, [assignment]);

  const mySubmissionInfo = useMemo(() => {
    if (!assignment?.my_submission) return null;

    const submission = assignment.my_submission;
    const submittedDate = new Date(submission.submittedDate);
    const deadline =
      assignment.submission_date ? new Date(assignment.submission_date) : null;

    let timeDiffString = "";
    let isLate = false;

    if (deadline) {
      const diff = deadline.getTime() - submittedDate.getTime();
      isLate = diff < 0;
      const absDiff = Math.abs(diff);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) timeDiffString += `${days} day${days > 1 ? "s" : ""} `;
      if (hours > 0) timeDiffString += `${hours} hour${hours > 1 ? "s" : ""} `;
      if (minutes > 0 && days === 0)
        timeDiffString += `${minutes} minute${minutes > 1 ? "s" : ""}`;
      timeDiffString = timeDiffString.trim();
    }

    return {
      ...submission,
      isLate,
      timeDiffString,
    };
  }, [assignment]);

  const handleEdit = async () => {
    if (isEditing && assignmentId) {
      let submissionDateString = "";
      if (dueDate && dueTime) {
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, "0");
        const day = String(dueDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        submissionDateString = `${dateStr} ${dueTime}`;
      }

      const success = await updateAssignment(assignmentId, {
        ...formData,
        submissionDate: submissionDateString || undefined,
      });
      if (success) {
        setIsEditing(false);
        await loadAssignmentDetail();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: assignment?.assignment_title || "",
      description: assignment?.assignment_description || "",
    });

    if (assignment?.submission_date) {
      const dateObj = new Date(assignment.submission_date);
      setDueDate(dateObj);
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      const seconds = dateObj.getSeconds().toString().padStart(2, "0");
      setDueTime(`${hours}:${minutes}:${seconds}`);
    } else {
      setDueDate(undefined);
      setDueTime("10:30:00");
    }

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmitAssignment = async () => {
    if (!assignmentId || !selectedFile) return;

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile);

    const result = await submitAssignment(assignmentId, formDataToSend);
    setIsSubmitting(false);

    if (result) {
      setSelectedFile(null);
      await loadAssignmentDetail();
    }
  };

  const handleDownloadSubmission = (submission: Submission) => {
    downloadSubmission(submission.id, submission.fileName);
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    const confirmMessage =
      "Are you sure you want to delete this submission? This action cannot be undone.";
    if (!confirm(confirmMessage)) return;

    const success = await deleteSubmission(submissionId);
    if (success) {
      await loadAssignmentDetail();
    }
  };

  const handleDelete = async () => {
    if (!assignmentId) return;

    const confirmMessage =
      "Are you sure you want to delete this assignment? This action cannot be undone.";

    if (!confirm(confirmMessage)) return;

    const success = await deleteAssignment(assignmentId);

    if (success) {
      navigate(`/course/${courseId}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getStatusBadge = (status: string, isLate?: boolean) => {
    if (status === "LATE" || isLate) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Late
        </Badge>
      );
    }
    if (status === "GRADED") {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Graded
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Submitted
      </Badge>
    );
  };

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted"
          onClick={() =>
            navigate(`/course/${toSlug(course?.course_name || "")}`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assignment.assignment_title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {course?.course_name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Assignment" : "Assignment Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ?
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
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
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none mt-1"
                />
              </div>
              <div>
                <Label className="px-1">Due Date (Optional)</Label>
                <div className="flex gap-4 mt-2">
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
                          {dueDate ?
                            dueDate.toLocaleDateString()
                          : "Select date"}
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
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </>
          : <>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{assignment.assignment_title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium whitespace-pre-wrap">
                  {assignment.assignment_description || "No description"}
                </p>
              </div>
              {assignment.submission_date && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Submission Date
                  </p>
                  <p className="font-medium">
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
                </div>
              )}
            </>
          }
        </CardContent>
      </Card>

      {/* Deadline Status for Students */}
      {!isTeacher && deadlineInfo.hasDeadline && (
        <Card
          className={
            deadlineInfo.isPastDeadline ?
              "border-destructive bg-destructive/5"
            : "border-green-500 bg-green-500/5"
          }
        >
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {deadlineInfo.isPastDeadline ?
                <>
                  <XCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">
                      Deadline Passed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Overdue by {deadlineInfo.timeString}
                    </p>
                  </div>
                </>
              : <>
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600">
                      Time Remaining
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {deadlineInfo.timeString} left to submit
                    </p>
                  </div>
                </>
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student: Show my submission or upload area */}
      {!isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {
              mySubmissionInfo ?
                // Show existing submission
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">
                          {mySubmissionInfo.fileName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(mySubmissionInfo.fileSize)} •
                          Submitted at{" "}
                          {new Date(
                            mySubmissionInfo.submittedDate,
                          ).toLocaleString("en-GB", {
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
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(
                        mySubmissionInfo.status,
                        mySubmissionInfo.isLate,
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadSubmission(mySubmissionInfo)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteSubmission(mySubmissionInfo.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Time diff info */}
                  {mySubmissionInfo.timeDiffString && (
                    <div
                      className={`text-sm p-2 rounded ${
                        mySubmissionInfo.isLate ?
                          "bg-destructive/10 text-destructive"
                        : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {mySubmissionInfo.isLate ?
                        `⚠️ Submitted late by ${mySubmissionInfo.timeDiffString}`
                      : `✓ Submitted early by ${mySubmissionInfo.timeDiffString}`
                      }
                    </div>
                  )}

                  {/* Allow resubmit if not past deadline */}
                  {!deadlineInfo.isPastDeadline && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        You can replace your submission with a different file:
                      </p>
                      <div>
                        <Label
                          htmlFor="file-reupload"
                          className="cursor-pointer"
                        >
                          <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors text-center">
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Click to select a replacement file
                            </p>
                          </div>
                          <Input
                            id="file-reupload"
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </Label>
                      </div>
                      {selectedFile && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm truncate">
                              {selectedFile.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                            >
                              Cancel
                            </Button>
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleSubmitAssignment}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Resubmit"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                // Show upload area
              : <>
                  {deadlineInfo.isPastDeadline ?
                    <div className="text-center py-8 text-muted-foreground">
                      <XCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
                      <p className="font-medium">Deadline Passed</p>
                      <p className="text-sm">
                        You cannot submit after the deadline
                      </p>
                    </div>
                  : <>
                      <div>
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Click to select a file to submit
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              or drag and drop files here
                            </p>
                          </div>
                          <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </Label>
                      </div>
                      {selectedFile && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Selected file:</p>
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm truncate">
                              {selectedFile.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                            >
                              Remove
                            </Button>
                          </div>
                          <Button
                            className="w-full mt-4"
                            onClick={handleSubmitAssignment}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Submit"}
                          </Button>
                        </div>
                      )}
                    </>
                  }
                </>

            }
          </CardContent>
        </Card>
      )}

      {/* Teacher: Show all submissions */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>
              Submissions ({assignment.submissions?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.submissions && assignment.submissions.length > 0 ?
              <div className="space-y-3">
                {assignment.submissions.map((submission: Submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <Link
                          to={getProfileUrl(submission.studentId, user?.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {submission.firstname && submission.lastname ?
                            `${submission.firstname} ${submission.lastname}`
                          : submission.studentName || submission.studentId}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {submission.fileName} •{" "}
                          {formatFileSize(submission.fileSize)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted at:{" "}
                          {new Date(submission.submittedDate).toLocaleString(
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
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSubmission(submission)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSubmission(submission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            : <p className="text-muted-foreground text-center py-8">
                No submissions yet
              </p>
            }
          </CardContent>
        </Card>
      )}

      {isTeacher && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {isEditing ?
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save</Button>
              </>
            : <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Assignment
              </Button>
            }
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Assignment
          </Button>
        </div>
      )}
    </div>
  );
};

export default Assignment;
