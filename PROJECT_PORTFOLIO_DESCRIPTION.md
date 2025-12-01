# Litter - Portfolio Project Description

## Project Overview

**Litter** is a full-stack social media web application that serves as a pixel-perfect Twitter clone, made especially for cats (no dogs allowed!). Users can create profiles, post tweets with images, reply to tweets, follow other users, and interact with content through likes. Built as a solo project demonstrating proficiency in full-stack development, cloud services integration, and modern web application architecture.

**Live Demo:** https://litter-twitter.herokuapp.com/

---

## Core Focus: AWS S3 Image Upload Integration

### The Main Achievement

Litter features a comprehensive AWS S3 image upload system that seamlessly integrates cloud storage with the application's content management. This implementation allows users to upload, store, and manage images associated with tweets and comments, with secure file validation, unique filename generation, and proper cloud infrastructure configuration.

Key points about this achievement:

- **S3 Bucket Configuration** - Properly configured S3 bucket with public read access via bucket policies while maintaining security through ACL controls and CORS settings
- **Secure File Validation** - Multi-layer validation including file extension checking, MIME type validation, and image header verification to prevent malicious uploads
- **Unique Filename Generation** - UUID-based filename generation to prevent naming conflicts and ensure unique storage keys
- **Database Integration** - Images are stored in S3 while metadata (URLs, associations, ownership) is tracked in the database for efficient querying

### Technical Implementation

The image upload system was implemented with a focus on security, scalability, and user experience:

- **boto3 SDK** - Python AWS SDK used for programmatic S3 interactions, configured with IAM user credentials for secure access
- **Multi-layer Validation** - File validation at multiple levels: client-side preview, backend extension checking, MIME type verification, and image header validation
- **IAM Security Model** - Custom IAM user with minimal required permissions (PutObject, GetObject, DeleteObject, ListBucket) following principle of least privilege
- **Database Relationships** - Image model with foreign keys to User, Tweet, and Comment models, enabling cascading deletes and proper data integrity

### Challenge & Solution

One of the main challenges was configuring S3 bucket permissions correctly while maintaining security best practices. AWS requires careful balancing between public read access (needed for displaying images) and blocking public access (security best practice). The solution involved using bucket policies to override the "Block all public access" setting for specific read operations while keeping ACL-based public access disabled. This approach allows controlled public read access for images while preventing unauthorized write operations, achieving both functionality and security.

---

## Full-Stack Architecture

### Frontend Stack
- **React 17.0.2** - Component-based UI library for building the interactive user interface
- **Redux** - State management for tweets, comments, users, and session data with Redux Thunk for async actions
- **React Router 5.2** - Client-side routing for navigation between pages and protected routes
- **React Scripts** - Build tool and development server configuration
- **CSS Modules** - Component-scoped styling with traditional CSS files

### Backend Stack
- **Flask 2.0.1** - Python web framework for RESTful API endpoints and server-side logic
- **SQLAlchemy 1.4.19** - ORM for database operations and relationship management
- **SQLite** - Development database (PostgreSQL on Heroku production)
- **Flask-Login** - User authentication and session management
- **WTForms** - Form validation and CSRF protection for secure form submissions
- **Alembic** - Database migration management for schema versioning

### Architecture Patterns
- **RESTful API Design** - Separate blueprint routes for auth, tweets, comments, users, images, likes, and follows with standard HTTP methods
- **Protected Routes** - Client-side route protection with authentication checks before rendering components
- **Separation of Concerns** - Clear separation between models, forms, API routes, and business logic
- **Integration Approach** - Frontend communicates with backend via fetch API, with CSRF token handling and session-based authentication

---

## Key Features (Brief Overview)

- **User Authentication** - Secure signup and login with password hashing, email validation, and session management
- **Tweet Management** - Create, read, update, and delete tweets with character limits and user ownership validation
- **Comment System** - Nested comment functionality allowing users to reply to tweets with full CRUD operations
- **Image Upload** - Upload images with tweets and comments, stored securely in AWS S3 with preview functionality
- **User Profiles** - View user profiles showing all tweets, with profile images and banner images
- **Like Functionality** - Like/unlike tweets with persistent state and real-time updates
- **Follow System** - Follow/unfollow other users with relationship tracking in database
- **Responsive UI** - Clean, pixel-perfect Twitter-inspired interface with modal forms and interactive components

---

## Deployment

- **Heroku** - Cloud platform deployment with Docker containerization for consistent environments
- **Heroku Postgres** - Managed PostgreSQL database service for production data persistence
- **AWS S3** - Cloud storage service for image hosting with public read access and secure upload permissions
- **GitHub Actions** - Automated CI/CD pipeline for testing and deployment on push to main branch

---

## Development Approach

Built as a full-stack project demonstrating end-to-end development skills. The project required implementing complex features like cloud storage integration, secure file handling, and maintaining data consistency across frontend and backend. The AWS S3 integration was particularly challenging, requiring deep understanding of cloud services, IAM permissions, and security best practices. Developed with a focus on clean code architecture, proper error handling, and scalable patterns that can handle growth in users and content.

---

## Skills Demonstrated

- **Full-Stack Development** - Built complete web application from database schema design to frontend UI components
- **Cloud Services Integration** - Integrated AWS S3 for cloud storage with proper IAM configuration and security practices
- **RESTful API Design** - Created comprehensive API endpoints with proper HTTP methods, status codes, and error handling
- **Database Design** - Designed relational database schema with proper foreign keys, relationships, and cascading behaviors
- **Authentication & Authorization** - Implemented secure user authentication with session management and route protection
- **File Upload & Validation** - Built robust file upload system with multi-layer validation and cloud storage integration
- **State Management** - Managed complex application state with Redux for tweets, comments, users, and authentication
- **Containerization** - Used Docker for consistent deployment environments and Heroku container deployment

---

## Project Highlights Summary

**Primary Achievement:** Successfully integrated AWS S3 cloud storage with a full-stack Flask/React application, implementing secure image upload functionality with multi-layer validation, proper IAM permissions, and database integration for a scalable content management system.

**Secondary Achievement:** Built a complete Twitter clone with pixel-perfect UI design, implementing all core social media features including authentication, CRUD operations, nested comments, likes, follows, and cloud-based image hosting.

**Technical Stack:** React, Redux, Flask, SQLAlchemy, PostgreSQL, AWS S3, boto3, Heroku, Docker, Python, JavaScript

**Development Style:** Full-stack development project focused on learning cloud services integration, security best practices, and building production-ready features from the ground up

---

