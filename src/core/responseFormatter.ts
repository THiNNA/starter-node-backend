import { Response } from 'express';

export interface ResponseHead {
  model: string;
  method: string;
  errorcode: string;
  errorflag: string;
  errordesc: string;
}

export interface ApiResponse<T> {
  head: ResponseHead;
  body: T;
}

export interface ResponseOptions {
  model: string;
  method: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: ResponseOptions,
  statusCode = 200,
): void {
  const response: ApiResponse<T> = {
    head: {
      model: options.model,
      method: options.method,
      errorcode: '0',
      errorflag: 'N',
      errordesc: '',
    },
    body: data,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  options: ResponseOptions,
): void {
  const response: ApiResponse<{
    items: T[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> = {
    head: {
      model: options.model,
      method: options.method,
      errorcode: '0',
      errorflag: 'N',
      errordesc: '',
    },
    body: {
      items: data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    },
  };
  res.status(200).json(response);
}
