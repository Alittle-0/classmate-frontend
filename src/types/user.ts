export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId (for backward compatibility)
  email: string;
  avatarUrl?: string;
  firstname: string;
  lastname: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstname: string;
  lastname: string;
  role: string;
}
