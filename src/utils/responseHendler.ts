type SuccessResponse<T> = {
  status: "success";
  statusCode: number;
  data: T;
  message: string;
};


export function successResponse<T>(
  data: T,
  message: string = "Operation successful",
  statusCode: number = 200
): SuccessResponse<T> {
  return {
    status: "success",
    statusCode,
    data,
    message,
  };
}


type ErrorResponse = {
  status: "error";
  statusCode: number;
  message: string;
  error?: unknown;
};


export function errorResponse(
  message: string,
  statusCode: number = 400,
  error?: unknown
): ErrorResponse {
  return {
    status: "error",
    statusCode,
    message,
    error: error instanceof Error ? error.message : error,
  };
}



export const Responses = {
  // 200 OK
  ok: <T>(data: T, message: string = "Request successful") =>
    successResponse(data, message, 200),

  // 201 Created
  created: <T>(data: T, message: string = "Resource created successfully") =>
    successResponse(data, message, 201),

  // 400 Bad Request
  badRequest: (message: string = "Bad request", error?: unknown) =>
    errorResponse(message, 400, error),

  // 401 Unauthorized
  unauthorized: (message: string = "Unauthorized access") =>
    errorResponse(message, 401),

  // 403 Forbidden
  forbidden: (message: string = "Forbidden") =>
    errorResponse(message, 403),

  // 404 Not Found
  notFound: (message: string = "Resource not found") =>
    errorResponse(message, 404),

  // 500 Internal Server Error
  serverError: (
    message: string = "Internal server error",
    error?: unknown
  ) => errorResponse(message, 500, error),
};
