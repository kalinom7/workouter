import { AppError } from './AppError.js';

export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred', code = 'CONFLICT') {
    super(message, 409, code);
  }
}
