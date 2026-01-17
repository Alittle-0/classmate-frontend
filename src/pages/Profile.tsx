import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigationStore } from "@/stores/useNavigationStore";
import Logout from "@/components/auth/Logout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/user";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const fetchUserById = useAuthStore((s) => s.fetchUserById);
  const changePassword = useAuthStore((s) => s.changePassword);
  const deactivateAccount = useAuthStore((s) => s.deactivateAccount);
  const reactivateAccount = useAuthStore((s) => s.reactivateAccount);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const setViewedProfileName = useNavigationStore(
    (s) => s.setViewedProfileName,
  );

  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    role: "",
  });

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Deactivate/Reactivate confirmation state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);

  // Track if we've already fetched for this userId to prevent loops
  const fetchedUserIdRef = useRef<string | null>(null);

  // Load user data
  useEffect(() => {
    // Case 1: Viewing own profile
    if (isOwnProfile && currentUser) {
      setViewedUser(currentUser);
      setViewedProfileName(null); // Clear profile name for own profile
      fetchedUserIdRef.current = null;
      return;
    }

    // Case 2: Viewing another user's profile - fetch by userId
    if (userId && !isOwnProfile && userId !== fetchedUserIdRef.current) {
      const loadUserProfile = async () => {
        setIsLoadingProfile(true);
        fetchedUserIdRef.current = userId;
        const user = await fetchUserById(userId);
        setViewedUser(user || null);
        // Set profile name for breadcrumb
        if (user) {
          setViewedProfileName(`${user.firstname} ${user.lastname}`);
        }
        setIsLoadingProfile(false);
      };
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOwnProfile]);

  // Update viewedUser when currentUser changes (for own profile after update)
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setViewedUser(currentUser);
    }
  }, [currentUser, isOwnProfile]);

  const handleEdit = async () => {
    if (isEditing) {
      const success = await updateProfile(formData);
      if (success) {
        setIsEditing(false);
      }
    } else {
      // Initialize formData when starting to edit
      if (viewedUser) {
        setFormData({
          firstname: viewedUser.firstname || "",
          lastname: viewedUser.lastname || "",
          role: viewedUser.role || "",
        });
      }
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: viewedUser?.firstname || "",
      lastname: viewedUser?.lastname || "",
      role: viewedUser?.role || "",
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  // Password change handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    // Clear errors when user types
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: undefined,
      });
    }
  };

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 10) {
      return "Password must be at least 10 characters long";
    }
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return undefined;
  };

  const handlePasswordSubmit = async () => {
    // Validate new password
    const newPasswordError = validatePassword(passwordData.newPassword);
    if (newPasswordError) {
      setPasswordErrors({ ...passwordErrors, newPassword: newPasswordError });
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    // Clear errors
    setPasswordErrors({});

    const success = await changePassword(passwordData);
    if (success) {
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    }
  };

  // Account status handlers
  const handleToggleAccountStatus = async () => {
    if (currentUser?.isActive) {
      const success = await deactivateAccount();
      if (success) {
        setStatusDialogOpen(false);
      }
    } else {
      const success = await reactivateAccount();
      if (success) {
        setStatusDialogOpen(false);
      }
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      setDeleteDialogOpen(false);
      navigate("/login");
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!viewedUser && !loading && !isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-2xl font-bold text-muted-foreground">
          User not found
        </h1>
        <Button variant="link" onClick={() => navigate("/profile")}>
          Go to your profile
        </Button>
      </div>
    );
  }

  if (loading && !viewedUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            {isOwnProfile ?
              "My Profile"
            : `${viewedUser?.firstname} ${viewedUser?.lastname}`}
          </h1>
          {viewedUser && (
            <Badge variant={viewedUser.isActive ? "default" : "destructive"}>
              {viewedUser.isActive ? "Active" : "Deactivated"}
            </Badge>
          )}
        </div>
        {isOwnProfile && (
          <div className="flex gap-2">
            <Logout />
            {isEditing ?
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            : <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            }
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentUser?.id === viewedUser?.id && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">ID</p>
            <p className="text-lg font-medium mt-1">{currentUser?.id}</p>
          </div>
        )}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Email</p>
          <p className="text-lg font-medium mt-1">{viewedUser?.email}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-muted/50 rounded-lg p-4 flex-1">
            <Label
              htmlFor="firstname"
              className="text-sm text-muted-foreground"
            >
              Firstname
            </Label>
            {isEditing && isOwnProfile ?
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="mt-1"
              />
            : <p className="text-lg font-medium mt-1">
                {viewedUser?.firstname}
              </p>
            }
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex-1">
            <Label htmlFor="lastname" className="text-sm text-muted-foreground">
              Lastname
            </Label>
            {isEditing && isOwnProfile ?
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="mt-1"
              />
            : <p className="text-lg font-medium mt-1">{viewedUser?.lastname}</p>
            }
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <Label htmlFor="role" className="text-sm text-muted-foreground">
            Role
          </Label>
          {isEditing && isOwnProfile ?
            <Select value={formData.role} onValueChange={handleSelectChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEACHER">TEACHER</SelectItem>
                <SelectItem value="STUDENT">STUDENT</SelectItem>
              </SelectContent>
            </Select>
          : <p className="text-lg font-medium mt-1 uppercase">
              {viewedUser?.role}
            </p>
          }
        </div>

        {/* Account Actions - Only for own profile */}
        {isOwnProfile && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="flex flex-wrap gap-3">
              {/* Change Password Dialog */}
              <Dialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <PasswordInput
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-destructive text-sm">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 10 characters and contain an
                        uppercase letter, lowercase letter, number, and special
                        character.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-destructive text-sm">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPasswordDialogOpen(false);
                        setPasswordErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordSubmit} disabled={loading}>
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Deactivate/Reactivate Account Dialog */}
              <Dialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className={
                      currentUser?.isActive ?
                        "bg-destructive !text-white hover:bg-background hover:!text-destructive hover:border-destructive border-2 border-destructive"
                      : ""
                    }
                    variant={currentUser?.isActive ? undefined : "default"}
                  >
                    {currentUser?.isActive ?
                      "Deactivate Account"
                    : "Reactivate Account"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {currentUser?.isActive ?
                        "Deactivate Account"
                      : "Reactivate Account"}
                    </DialogTitle>
                    <DialogDescription>
                      {currentUser?.isActive ?
                        "Are you sure you want to deactivate your account? You can reactivate it later."
                      : "Would you like to reactivate your account?"}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setStatusDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={
                        currentUser?.isActive ?
                          "bg-destructive !text-white hover:bg-background hover:!text-destructive hover:border-destructive border-2 border-destructive"
                        : ""
                      }
                      variant={currentUser?.isActive ? undefined : "default"}
                      onClick={handleToggleAccountStatus}
                      disabled={loading}
                    >
                      {loading ?
                        "Processing..."
                      : currentUser?.isActive ?
                        "Deactivate"
                      : "Reactivate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Account Dialog */}
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-destructive !text-white hover:bg-background hover:!text-destructive hover:border-destructive border-2 border-destructive">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete your account?
                      This action cannot be undone and all your data will be
                      lost.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-destructive !text-white hover:bg-background hover:!text-destructive hover:border-destructive border-2 border-destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete Permanently"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
