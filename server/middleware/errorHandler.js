import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Invalid JSON in request body', 400);
  }

  if (err.code === 'PGRST116') {
    return sendError(res, 'Resource not found', 404);
  }

  return sendError(res, err.message || 'Internal Server Error', err.statusCode || 500);
};
