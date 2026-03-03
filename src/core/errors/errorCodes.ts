import { AppError } from "./AppError";

// ─── Validation Errors (E00001–E00009) ───────────────────────
export const VALIDATION_ERROR = (detail?: string) =>
  new AppError("E00001", "Validation error", 400, detail);

export const INVALID_ARTICLE_DATA = (detail?: string) =>
  new AppError("E00002", "Invalid article data", 400, detail);

export const INVALID_CATEGORY_DATA = (detail?: string) =>
  new AppError("E00003", "Invalid category data", 400, detail);

export const INVALID_CREDENTIALS_FORMAT = (detail?: string) =>
  new AppError("E00004", "Invalid credentials format", 400, detail);

// ─── Authentication Errors (E00010–E00019) ───────────────────
export const INVALID_CREDENTIALS = () =>
  new AppError("E00010", "Invalid email or password", 401);

export const TOKEN_EXPIRED = () =>
  new AppError("E00011", "Token has expired", 401);

export const TOKEN_INVALID = () =>
  new AppError("E00012", "Invalid or missing token", 401);

export const USER_ALREADY_EXISTS = () =>
  new AppError("E00013", "A user with this email already exists", 409);

// ─── Authorization Errors (E00020–E00029) ────────────────────
export const FORBIDDEN = () =>
  new AppError("E00020", "You do not have permission to perform this action", 403);

export const ADMIN_ONLY = () =>
  new AppError("E00021", "This action requires admin privileges", 403);

// ─── Article Workflow Errors (E00030–E00039) ─────────────────
export const ARTICLE_NOT_FOUND = () =>
  new AppError("E00030", "Article not found", 404);

export const ARTICLE_ALREADY_PUBLISHED = () =>
  new AppError("E00031", "Article is already published", 400);

export const ARTICLE_NOT_PENDING = () =>
  new AppError("E00032", "Article must be in PENDING status for this action", 400);

export const CANNOT_EDIT_PUBLISHED = () =>
  new AppError("E00033", "Cannot edit a published article", 400);

export const REJECT_REASON_REQUIRED = () =>
  new AppError("E00034", "A reason is required when rejecting an article", 400);

// ─── Category Errors (E00040–E00049) ─────────────────────────
export const CATEGORY_NOT_FOUND = () =>
  new AppError("E00040", "Category not found", 404);

export const CATEGORY_ALREADY_EXISTS = () =>
  new AppError("E00041", "A category with this name already exists", 409);

export const CATEGORY_HAS_ARTICLES = () =>
  new AppError("E00042", "Cannot delete category that has articles", 400);

// ─── System Errors (E00050–E00059) ───────────────────────────
export const INTERNAL_ERROR = (detail?: string) =>
  new AppError("E00050", "Internal server error", 500, detail);

export const DATABASE_ERROR = (detail?: string) =>
  new AppError("E00051", "Database operation failed", 500, detail);
