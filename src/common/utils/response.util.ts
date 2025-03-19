
export const successResponse = (statusCode: number, message: string, data?: object) => ({
  statusCode,
  message,
  data,
});

export const errorResponse = (
  statusCode : number,
  errorMessage: string,
) => ({
  statusCode,
  errorMessage,
});
