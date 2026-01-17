import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a profile URL for a user using userId
// If currentUserId is provided and matches userId, returns /profile (own profile)
export function getProfileUrl(userId: string, currentUserId?: string): string {
  if (currentUserId && userId === currentUserId) {
    return "/profile";
  }
  return `/profile/${userId}`;
}
