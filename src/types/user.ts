export interface User {
  id: string;
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
