import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationStore, toSlug } from "@/stores/useNavigationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, ArrowLeft, Download, FileText, X } from "lucide-react";

interface LectureFile {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdDate: string;
}

interface LectureData {
  id: string;
  title: string;
  description: string;
  courseId: string;
  files: LectureFile[];
  fileCount: number;
  totalFileSize: number;
  uploadedBy: string;
  createdDate: string;
  lastModifiedDate?: string;
}

const Lecture = () => {
  const { courseSlug: _courseSlug, lectureSlug: _lectureSlug } = useParams<{
    courseSlug: string;
    lectureSlug: string;
  }>();
  const navigate = useNavigate();
  const { courseId, lectureId } = useNavigationStore();
  const {
    getLectureById,
    fetchCourseDetail,
    updateLecture,
    deleteLecture,
    downloadLectureFile,
    addFilesToLecture,
    deleteLectureFile,
    user,
  } = useAuthStore();

  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    loadLectureDetail();
    loadCourseDetail();
  }, [lectureId, courseId]);

  const loadLectureDetail = async () => {
    if (!lectureId) return;
    const data = await getLectureById(lectureId);
    setLecture(data);
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
      });
    }
  };

  const loadCourseDetail = async () => {
    if (!courseId) return;
    const data = await fetchCourseDetail(courseId);
    setCourse(data);
  };

  const handleEdit = async () => {
    if (isEditing && lectureId) {
      // Update lecture info (title and description)
      const success = await updateLecture(lectureId, {
        title: formData.title,
        description: formData.description,
      });

      if (success) {
        // If there are new files, add them
        if (newFiles.length > 0) {
          const formDataToSend = new FormData();
          newFiles.forEach((file) => {
            formDataToSend.append("files", file);
          });
          await addFilesToLecture(lectureId, formDataToSend);
        }

        setIsEditing(false);
        setNewFiles([]);
        await loadLectureDetail();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: lecture?.title || "",
      description: lecture?.description || "",
    });
    setNewFiles([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files!);
      // Append new files to existing ones
      setNewFiles((prev) => {
        const updated = [...prev, ...filesArray];
        return updated;
      });

      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const handleRemoveNewFile = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDownloadFile = (file: LectureFile) => {
    downloadLectureFile(file.id, file.fileName);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!lectureId) return;

    const confirmMessage =
      "Are you sure you want to delete this file? This action cannot be undone.";
    if (!confirm(confirmMessage)) return;

    const success = await deleteLectureFile(lectureId, fileId);
    if (success) {
      await loadLectureDetail();
    }
  };

  const handleDelete = async () => {
    if (!lectureId) return;

    const confirmMessage =
      "Are you sure you want to delete this lecture and all its files? This action cannot be undone.";

    if (!confirm(confirmMessage)) return;

    const success = await deleteLecture(lectureId);

    if (success) {
      navigate(`/course/${toSlug(course?.course_name || "")}`);
    }
  };

  const fullName = `${user?.firstname} ${user?.lastname}`;
  const teacher_name = `${course?.teacher_firstname} ${course?.teacher_lastname}`;

  const isTeacher =
    fullName === teacher_name || fullName === course?.sub_teacher_name;


  if (!lecture) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lecture not found</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(`/course/${toSlug(course?.course_name || "")}`)
          }
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {course?.course_name}
          </p>
        </div>
      </div>

      {/* Lecture Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lecture Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ?
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter lecture title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter lecture description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newFiles">Add More Files (Optional)</Label>
                <Input
                  id="newFiles"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="cursor-pointer"
                />
                {newFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Selected {newFiles.length} file(s) to add:
                    </p>
                    <div className="space-y-1">
                      {newFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNewFile(index)}
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
            </>
          : <>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{lecture.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{lecture.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="font-medium">{lecture.fileCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="font-medium">
                    {formatFileSize(lecture.totalFileSize)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">
                    {new Date(lecture.createdDate).toLocaleString("en-GB", {
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
                {lecture.lastModifiedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Modified
                    </p>
                    <p className="font-medium">
                      {new Date(lecture.lastModifiedDate).toLocaleString(
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
            </>
          }
        </CardContent>
      </Card>

      {/* Files Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lecture Files ({lecture.fileCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lecture.files && lecture.files.length > 0 ?
            lecture.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.fileSize)} • {file.contentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isTeacher && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          : <p className="text-center text-muted-foreground py-4">
              No files uploaded yet
            </p>
          }
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div></div>
        {isTeacher && (
          <div className="flex gap-2">
            {isEditing ?
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save Changes</Button>
              </>
            : <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Info
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Lecture
                </Button>
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Lecture;
