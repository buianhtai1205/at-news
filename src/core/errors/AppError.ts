export type ErrorCode = string;

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly detail?: string;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, detail?: string) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.detail ? { detail: this.detail } : {}),
    };
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  console.error("Unhandled error:", error);
  return Response.json(
    {
      code: "E00050",
      message: "Internal server error",
    },
    { status: 500 }
  );
}
