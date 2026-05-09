# API Smoke Validation Guide

Goal: manually validate that the route refactor did not change functional behavior.

## Prerequisites

- API running (`pnpm api:dev` from the repository root)
- Valid user for login
- Session JWT token
- Test files: `.pdf`, `.docx`, `.pptx`

## 1) Login

1. Authenticate with the existing flow (`/auth/*`, depending on the current setup).
2. Confirm that a JWT token is returned.
3. Retry with invalid credentials and verify the expected error.

## 2) Process URL

### POST `/api/process-url`

- Send `{ "url": "https://..." }`
- Verify a `200` response with a processed document.

### GET `/api/process-url`

- Verify `405` with a method-not-allowed message.

## 3) Process PDF

### POST `/api/process-file` (multipart)

- Send `file=@sample.pdf`
- Verify `200` and the `ProcessedDocument` shape.

## 4) Process DOCX

### POST `/api/process-file` (multipart)

- Send `file=@sample.docx`
- Verify `200` and the `ProcessedDocument` shape.

## 5) Process PPTX

### POST `/api/process-file` (multipart)

- Send `file=@sample.pptx`
- Verify `200` and the `ProcessedDocument` shape.

## 6) Save document

### POST `/api/save-document` (Bearer JWT)

- Save a document with the expected fields (`title`, `content`, `original_url`, etc.).
- Verify `201`, `success: true`, and `document.id`.

## 7) List & Get

### GET `/api/documents` (Bearer JWT)

- Verify `200`, `success: true`, `count >= 1`, and a `documents` array.

### GET `/api/documents/:id` (Bearer JWT)

- Verify `200` for a valid document ID owned by the user.
- Verify `404` for a non-existent or unauthorized ID.

## 8) Update

### PATCH `/api/documents/:id` (Bearer JWT)

- Send a partial update (`title` or `content`).
- Verify `200`, `success: true`, and persisted changes.

## 9) Delete

### DELETE `/api/documents/:id` (Bearer JWT)

- Verify `200`, `success: true`, and `deletedId`.
- Repeat delete for the same ID and verify `404`.

## 10) Chat (if applicable to the environment)

- Run the `document-chat` flow with an existing document.
- Verify that it responds without contract changes and preserves the expected citations/structure.
