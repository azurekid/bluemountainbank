# Admin Authentication Guide

## Overview

This document outlines the implementation of admin authentication for Blue Mountain Bank's administration portal. The authentication system provides security for admin pages, session management, and proper login/logout flows.

## Authentication Flow

1. **Admin Login**
   - Admin users log in through the standard `/login.html` page
   - Admin credentials are validated client-side (in a production environment, this should be server-side)
   - Successful admin authentication creates a secure session with a 30-minute expiration

2. **Session Management**
   - Admin sessions expire automatically after 30 minutes of inactivity
   - A visual countdown timer shows remaining session time
   - Sessions are automatically extended with activity on admin pages
   - Sessions are stored in `sessionStorage` for security (cleared when browser is closed)

3. **Access Control**
   - All admin pages (`/admin.html` and pages in the `/admin/` directory) check for valid admin session
   - Unauthorized access attempts are redirected to the login page
   - After login, users are redirected back to their originally requested admin page

4. **Logout Flow**
   - Admin logout clears all session data
   - User is redirected to login page

## Implementation Details

### Session Storage

Admin sessions are stored with the following keys:

- `adminSession`: Set to `'true'` when admin is logged in
- `adminUser`: Username of the authenticated admin
- `adminLoginTime`: ISO timestamp of when the admin logged in
- `adminSessionExpiry`: ISO timestamp of when the session will expire

### Security Considerations

This implementation provides basic authentication for the admin portal. For a production environment, consider the following enhancements:

1. **Server-side authentication**: Move credential validation to the server
2. **HTTPS**: Ensure all admin pages are served over HTTPS
3. **Strong password policy**: Implement stronger password requirements
4. **Two-factor authentication**: Add an additional security layer
5. **IP restrictions**: Limit admin access to specific IP ranges
6. **Audit logging**: Log all admin authentication events and actions

## Admin Credentials

For testing purposes, use the following admin credentials:

- **Username**: admin
- **Password**: admin123

> ⚠️ **IMPORTANT**: Change the default credentials before deploying to production.

## Troubleshooting

If users experience issues with admin authentication:

1. **Session Expired**: The most common issue is session expiration. Simply log in again.
2. **Browser Issues**: Try clearing browser cache and cookies.
3. **Multiple Tabs**: Opening multiple admin sessions in different tabs can cause session conflicts.
4. **Private Browsing**: Private/incognito mode may interfere with sessionStorage.
