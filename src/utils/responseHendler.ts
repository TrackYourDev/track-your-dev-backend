export const successResponse = (
  res: any,
  message: string,
  data: any = {},
  statusCode: number
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: any,
  message: string,
  statusCode: number,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
