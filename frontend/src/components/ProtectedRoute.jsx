/**
 * Protected Route Component
 * 
 * Wrapper component that provides role-based access control for routes.
 * Redirects unauthorized users to the login page.
 * 
 * @module components/ProtectedRoute
 * @author SMK Rajasa Development Team
 */

import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import auth from '../utils/auth';

/**
 * ProtectedRoute Component
 * 
 * @param {Object} props - Component props
 * @param {import('preact').ComponentChildren} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: '/')
 * @returns {import('preact').VNode|null} Protected content or null
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  /**
   * Check if user is authenticated and has required role
   */
  const checkAuthorization = () => {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      route(redirectTo, true);
      setIsAuthorized(false);
      return;
    }

    // If no specific roles required, just check authentication
    if (!allowedRoles || allowedRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has required role
    const userRole = auth.getUserRole();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (roles.includes(userRole)) {
      setIsAuthorized(true);
    } else {
      console.warn(`User role '${userRole}' not authorized. Required: ${roles.join(', ')}`);
      route(redirectTo, true);
      setIsAuthorized(false);
    }
  };

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return isAuthorized ? children : null;
}
