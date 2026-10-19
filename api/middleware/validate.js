import { sendError } from '../utils/response.js';
import { validateRequired } from '../utils/validators.js';

export const validate = (requiredFields) => {
  return (req, res, next) => {
    const errors = validateRequired(requiredFields, req.body);
    if (errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }
    next();
  };
};
