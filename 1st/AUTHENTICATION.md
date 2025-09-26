# Authentication System Implementation

This document describes the JWT-based authentication system with session management that has been implemented in this NestJS application.

## Features Implemented

### 1. JWT Token Generation
- Tokens are generated with a 15-minute expiration time
- Tokens include user information and session ID
- Tokens are signed with a secret key from environment variables

### 2. Session Management
- Sessions are stored in the database with UUID identifiers
- Each session tracks:
  - User ID (foreign key to users table)
  - Issue time (when the session was created)
  - Expiration time (15 minutes from issue time)
  - Invalidated status (for explicit logout)
- Sessions are automatically invalidated when they expire

### 3. Cookie Handling
- JWT tokens are stored in httpOnly cookies for security
- Cookies have the same lifetime as sessions (15 minutes)
- Cookies are configured with secure and sameSite flags for production

### 4. Session Validation
- Sessions are validated on each request to protected routes
- Validation checks:
  - Session exists in database
  - Session is not invalidated
  - Session has not expired
- Invalid sessions result in 401 Unauthorized responses

### 5. Logout Functionality
- Explicit logout invalidates the session immediately
- Session expiration time is set to current time
- httpOnly cookie is cleared on logout

## Implementation Details

### Database Schema
The system uses three main tables:
1. `users` - Stores user information
2. `bookmarks` - Stores user bookmarks
3. `sessions` - Stores session information

The `sessions` table has the following structure:
```prisma
model Session {
  id         String    @id @default(uuid())
  userId     Int
  user       User      @relation(fields: [userId], references: [id])
  issuedAt   DateTime  @default(now())
  expiresAt  DateTime
  invalidated Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

### Key Components

#### AuthService
Handles authentication logic including:
- User signup and login
- Session creation and token generation
- Session validation
- Logout functionality

#### SessionGuard
A NestJS guard that validates sessions on protected routes.

#### JwtStrategy
Validates JWT tokens and checks session validity.

### API Endpoints

#### POST /auth/signup
Creates a new user account and returns a JWT token.

#### POST /auth/login
Authenticates a user and returns a JWT token.

#### POST /auth/logout
Invalidates the current session and clears the auth cookie.

#### GET /users/me
Returns the current user's information (protected route).

## Security Features

1. **httpOnly Cookies**: Tokens are stored in httpOnly cookies to prevent XSS attacks.
2. **Secure Cookies**: Cookies are marked as secure in production environments.
3. **SameSite Protection**: Cookies use sameSite=strict to prevent CSRF attacks.
4. **Session Validation**: Each request validates the session to ensure it's still valid.
5. **Immediate Invalidation**: Sessions are immediately invalidated on logout.
6. **Automatic Expiration**: Sessions automatically expire after 15 minutes.

## Environment Variables

The system requires the following environment variables:
- `JWT_SECRET` - Secret key for signing JWT tokens
- `DATABASE_URL` - Connection string for the PostgreSQL database
- `PORT` - Port for the application to listen on

## Testing

Unit tests have been implemented for the AuthService to verify:
- Session creation and token generation
- Session validation for various scenarios (valid, expired, invalidated, non-existent)
- Logout functionality

## Future Improvements

1. **Refresh Tokens**: Implement refresh tokens for better user experience
2. **Role-Based Access Control**: Add user roles and permissions
3. **Rate Limiting**: Implement rate limiting for authentication endpoints
4. **Audit Logging**: Add logging for authentication events