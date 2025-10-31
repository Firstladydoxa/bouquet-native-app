import { User } from '@/types';

/**
 * Utility functions for user data handling
 */

/**
 * Get the user's full name from firstname and lastname
 * Falls back to username or email if names are not available
 */
export function getUserFullName(user: User): string {
  if (!user) return 'User';
  
  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
  
  if (fullName) {
    return fullName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Get the user's display name (first name only or username)
 * Used for casual greetings
 */
export function getUserDisplayName(user: User): string {
  if (!user) return 'User';
  
  if (user.firstname) {
    return user.firstname;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user: User): string {
  if (!user) return 'U';
  
  const firstname = user.firstname || '';
  const lastname = user.lastname || '';
  
  if (firstname && lastname) {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  }
  
  if (firstname) {
    return firstname.charAt(0).toUpperCase();
  }
  
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
}