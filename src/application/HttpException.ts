export interface ApplicationException {
  readonly message: string;
  readonly name: string;
  readonly status: number;
}
export class HttpException extends Error implements ApplicationException {
  constructor(
    public override readonly message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'HttpException';
  }
}
export class InternalServerErrorException extends HttpException {
  constructor(message: string) {
    super(message, 500);
    this.name = 'InternalServerErrorException';
  }
}
export class UnknownException extends InternalServerErrorException {
  constructor(message: string = 'Unknown error') {
    super(message);
    this.name = 'UnknownException';
  }
}
export class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}
