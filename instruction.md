# Product Requirements Document (PRD)

## Project Overview

Simple file conversion web service to convert images from one format to another. The service will be built using the Hono framework for Node.js inside a Next.js application.

## Purpose

To develop a web service that allows users to upload files, convert them to specified formats, and retrieve the converted files.

## Core Functionality

### 1. Provide a single home page to upload multiple files and simple select to choose target file extension.

- Users should be able to upload files in different extensions.
- Users should be able to select the target file extension.
- Support only image formats, including WebP and AVIF. Validate that uploaded files are images.

#### User Interface: File Upload Form

- A simple HTML form that allows users to select and upload files.
- Support drag-and-drop functionality.
- Display progress indicators during upload.

### 2. Download files after conversion in selected extension

- Ensure users can download files after conversion.

### 3. API Endpoints

**POST /upload**

- **Description**: Accepts file uploads and processes them for conversion.
- **Request Body**: Multipart/form-data containing the file to be uploaded.
- **Response**: JSON object containing:
  - `message`: Confirmation of successful conversion.
  - `path`: URL or path to the converted file.

### 4. File Conversion Logic

- Convert uploaded files to specified formats using Sharp (e.g., converting images to JPEG).
- Validate file types before processing to ensure compatibility.
- Handle errors gracefully and return appropriate error messages.
- Logic should be implemented "sharp" package

### 5. Non-Functional Requirements

- **Performance**: The service should handle multiple concurrent uploads without significant degradation in performance.
- **Security**: Implement measures to prevent unauthorized file uploads and potential security vulnerabilities (e.g., file type validation).
- **Scalability**: The architecture should allow for future enhancements, such as supporting more file formats or additional processing features.

## File Structure

The following structure will be used for the project:

├── README.md
├── instruction.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── src
│ └── app
│ ├── api
│ │ └── upload
│ │ └── route.ts # API endpoint for file upload and conversion
│ ├── components # Reusable UI components (if needed)
│ │ └── FileUploadForm.tsx # Component for file upload form with drag-and-drop
│ ├── layout.tsx # Main layout component for the application
│ └── page.tsx # Home page component with file upload interface
└── tsconfig.json
