# GrowAIs

## Project Overview

GrowAIs is an educational web platform designed to support students, teachers, and platform administrators through interactive learning experiences.

The platform is being developed with separate interfaces for students, teachers, and administrators.

## Main Features

### Student Portal
- Student dashboard
- Lessons and learning modules
- Quizzes and quiz results
- Interactive scenarios and scenario results
- Learning goals and progress tracking
- AI Assistant

### Teacher Portal
- Teacher dashboard
- Class management
- Class details
- Assigning learning content
- Student progress monitoring
- Results and performance tracking

### Platform Admin Portal
- Admin dashboard
- School and user management
- Content management and editing
- Analytics
- Platform settings

## Project Structure

The repository is organized into the following main folders:

- `growais-frontend/` — Frontend application and user interface.
- `growais-backend/` — Backend application and server-side functionality.
- `Databases/` — Database-related files and SQL scripts.

## Technology Stack

The project uses the following technologies:

- **Frontend:** React / Next.js
- **Backend:** Node.js
- **Database:** PostgreSQL
- **Database Management:** pgAdmin
- **Version Control:** Git and GitHub
- **Deployment:** Render / Netlify (deployment configuration in progress)

## Database

The project uses PostgreSQL for storing application data.

The database is hosted on Render. The database connection and deployment configuration are currently being reviewed.

Database credentials and environment variables should be configured locally or through the hosting provider. They must not be committed to this public repository.

## Current Project Status

The project has been pushed to GitHub for review.

The main areas requiring review and assistance are:

1. Verify the frontend and backend configuration.
2. Review the PostgreSQL database schema and SQL scripts.
3. Verify the backend database connection.
4. Check environment variables and API configuration.
5. Resolve remaining deployment and integration issues.
6. Verify that the deployed website works correctly.

## Repository Purpose

This repository is being shared with the project supervisor for code review, troubleshooting, and assistance with completing the deployment.

## Security Notice

This repository is public. Do not upload database passwords, API keys, authentication secrets, private connection strings, or other sensitive credentials.

Use environment variables and the hosting provider's environment settings for sensitive configuration.

---

**Project:** GrowAIs  
**Status:** Development and deployment in progress
