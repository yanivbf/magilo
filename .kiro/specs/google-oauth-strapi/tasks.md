# Implementation Plan - Google OAuth Authentication with Strapi

- [ ] 1. Configure Strapi for Google OAuth
  - Set up Google OAuth provider in Strapi Users & Permissions plugin
  - Add environment variables for Google Client ID and Secret
  - Configure JWT settings and expiration
  - Add custom fields to User model (name, avatar, googleId)
  - Update CORS configuration for SvelteKit origin
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3_

- [ ] 1.1 Write property test for Google OAuth provider configuration
  - **Property 17: HTTPS usage for OAuth**
  - **Validates: Requirements 6.1**

- [ ] 2. Create OAuth callback API route in SvelteKit
  - Create `/api/auth/google/callback/+server.js` endpoint
  - Implement POST handler to receive Google credential
  - Exchange credential with Strapi OAuth endpoint
  - Return JWT token and user data to client
  - Add error handling for OAuth failures
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.4_

- [ ] 2.1 Write property test for authorization code exchange
  - **Property 1: Authorization code exchange**
  - **Validates: Requirements 1.3**

- [ ] 2.2 Write property test for user record operations
  - **Property 2: User record creation or update**
  - **Validates: Requirements 1.4**

- [ ] 2.3 Write property test for JWT generation
  - **Property 3: JWT generation after user operation**
  - **Validates: Requirements 1.5**

- [ ] 2.4 Write unit tests for callback handler
  - Test credential validation
  - Test Strapi API calls with mocked responses
  - Test error handling scenarios
  - _Requirements: 1.2, 1.3, 5.1, 5.4_

- [ ] 3. Update auth store for Strapi integration
  - Remove Supabase client initialization
  - Update `signInWithGoogle()` to call new callback endpoint
  - Implement JWT token storage in localStorage
  - Implement `validateToken()` function for Strapi
  - Update `signOut()` to clear JWT token
  - Add token expiration handling
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 6.2, 6.4_

- [ ] 3.1 Write property test for token storage
  - **Property 4: Token storage on authentication**
  - **Validates: Requirements 2.1**

- [ ] 3.2 Write property test for token validation
  - **Property 5: Token validation on page refresh**
  - **Validates: Requirements 2.2**

- [ ] 3.3 Write property test for auth state restoration
  - **Property 6: Auth state restoration for valid tokens**
  - **Validates: Requirements 2.3**

- [ ] 3.4 Write property test for invalid token handling
  - **Property 7: Auth state clearing for invalid tokens**
  - **Validates: Requirements 2.4**

- [ ] 3.5 Write property test for logout token clearing
  - **Property 8: Token clearing on logout**
  - **Validates: Requirements 3.1**

- [ ] 3.6 Write property test for auth state reset
  - **Property 9: Auth state reset after token clear**
  - **Validates: Requirements 3.2**

- [ ] 3.7 Write unit tests for auth store functions
  - Test signInWithGoogle with mocked responses
  - Test signOut clears state correctly
  - Test validateToken with valid/invalid tokens
  - Test localStorage operations
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 4. Update login page for new auth flow
  - Keep Google Identity Services (GSI) button rendering
  - Update `handleGoogleResponse()` to use new auth store
  - Remove Supabase-specific code
  - Update error message handling for Strapi responses
  - Test Google Sign-In button functionality
  - _Requirements: 1.1, 5.1, 5.3_

- [ ] 4.1 Write unit tests for login page
  - Test Google button renders correctly
  - Test error message display
  - Test loading states
  - Test redirect after successful auth
  - _Requirements: 1.1, 5.1_

- [ ] 5. Implement protected routes middleware
  - Update `hooks.server.js` to validate JWT tokens
  - Extract token from cookies or Authorization header
  - Validate token with Strapi `/api/users/me` endpoint
  - Set `event.locals.user` for authenticated requests
  - Handle token validation failures
  - _Requirements: 2.2, 2.3, 2.4, 6.3, 7.3_

- [ ] 5.1 Write property test for JWT signature verification
  - **Property 19: JWT signature verification**
  - **Validates: Requirements 6.3**

- [ ] 5.2 Write property test for protected route verification
  - **Property 23: Protected route authentication verification**
  - **Validates: Requirements 7.3**

- [ ] 5.3 Write unit tests for hooks middleware
  - Test token extraction from cookies and headers
  - Test token validation with Strapi
  - Test user data setting in event.locals
  - Test error handling for invalid tokens
  - _Requirements: 2.2, 2.3, 2.4, 7.3_

- [ ] 6. Implement user data management
  - Ensure new users are created with complete profile data
  - Ensure existing users are updated on re-authentication
  - Verify email, name, avatar, and googleId are stored
  - Set provider field to "google" for OAuth users
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6.1 Write property test for new user creation
  - **Property 11: New user record creation**
  - **Validates: Requirements 4.1**

- [ ] 6.2 Write property test for existing user update
  - **Property 12: Existing user record update**
  - **Validates: Requirements 4.2**

- [ ] 6.3 Write property test for user data completeness
  - **Property 13: User data completeness**
  - **Validates: Requirements 4.3**

- [ ] 6.4 Write property test for provider field
  - **Property 14: Provider field marking**
  - **Validates: Requirements 4.4**

- [ ] 7. Implement comprehensive error handling
  - Add error handling for OAuth failures
  - Add error handling for Strapi backend unavailability
  - Add error handling for network errors with retry logic
  - Display user-friendly error messages
  - Log technical error details for debugging
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7.1 Write property test for OAuth error handling
  - **Property 15: OAuth failure error handling**
  - **Validates: Requirements 5.1**

- [ ] 7.2 Write property test for network error handling
  - **Property 16: Network error handling**
  - **Validates: Requirements 5.4**

- [ ] 7.3 Write unit tests for error scenarios
  - Test Google OAuth failure handling
  - Test Strapi unavailable handling
  - Test permission denial handling
  - Test network error retry logic
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement security measures
  - Ensure all OAuth requests use HTTPS
  - Implement secure token storage (httpOnly cookies or secure localStorage)
  - Verify JWT signatures on all validations
  - Implement token expiration and re-authentication
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.1 Write property test for secure token storage
  - **Property 18: Secure token storage**
  - **Validates: Requirements 6.2**

- [ ] 8.2 Write property test for token expiry handling
  - **Property 20: Re-authentication on token expiry**
  - **Validates: Requirements 6.4**

- [ ] 9. Update dashboard and user profile display
  - Display user name and profile picture after authentication
  - Show user-specific content based on Strapi user ID
  - Update navigation to show authenticated user info
  - Add logout button functionality
  - _Requirements: 3.3, 7.1, 7.2_

- [ ] 9.1 Write property test for redirect after auth reset
  - **Property 10: Redirect after auth reset**
  - **Validates: Requirements 3.3**

- [ ] 9.2 Write property test for user info display
  - **Property 21: User info display after authentication**
  - **Validates: Requirements 7.1**

- [ ] 9.3 Write property test for content personalization
  - **Property 22: User-specific content personalization**
  - **Validates: Requirements 7.2**

- [ ] 9.4 Write unit tests for dashboard components
  - Test user info display
  - Test logout button functionality
  - Test user-specific content rendering
  - _Requirements: 3.3, 7.1, 7.2_

- [ ] 10. Remove Supabase dependencies
  - Remove `@supabase/supabase-js` from package.json
  - Remove Supabase CDN script from HTML
  - Remove Supabase configuration constants
  - Clean up unused Supabase code
  - Update environment variables documentation
  - _Requirements: All (cleanup)_

- [ ] 11. Update environment configuration
  - Add Google OAuth environment variables to `.env` files
  - Document required environment variables
  - Create `.env.example` files for both Strapi and SvelteKit
  - Update deployment documentation
  - _Requirements: 1.1, 6.1_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Integration testing
  - Test complete OAuth flow from button click to dashboard
  - Test user creation in Strapi
  - Test JWT token generation and storage
  - Test session persistence across page refreshes
  - Test protected routes access control
  - Test logout flow
  - _Requirements: All_

- [ ] 14. Final verification and documentation
  - Verify all requirements are met
  - Test with new Google account (user creation)
  - Test with existing Google account (user update)
  - Test error scenarios (deny permissions, network errors)
  - Update API documentation
  - Create migration guide from Supabase
  - _Requirements: All_
