import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

interface ValidationErrorPayload {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
  message?: string;
}

const FALLBACK_ERROR_SUMMARY = 'Request failed';
const FALLBACK_NETWORK_DETAIL = 'Unable to connect. Please check your internet connection.';
const FALLBACK_SERVER_DETAIL = 'Something went wrong. Please try again.';

function isValidationErrorPayload(value: unknown): value is ValidationErrorPayload {
  return typeof value === 'object' && value !== null;
}

function flattenValidationErrors(errors: Record<string, string[]>): string[] {
  return Object.entries(errors).flatMap(([field, messages]) => {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    return messages.map(message => `${field}: ${message}`);
  });
}

function parseErrorMessages(error: HttpErrorResponse): { summary: string; details: string[] } {
  if (error.status === 0) {
    return {
      summary: FALLBACK_ERROR_SUMMARY,
      details: [FALLBACK_NETWORK_DETAIL],
    };
  }

  const payload = error.error;
  if (typeof payload === 'string' && payload.trim()) {
    return {
      summary: FALLBACK_ERROR_SUMMARY,
      details: [payload],
    };
  }

  if (isValidationErrorPayload(payload)) {
    if (payload.errors && Object.keys(payload.errors).length > 0) {
      const details = flattenValidationErrors(payload.errors);
      return {
        summary: payload.title || FALLBACK_ERROR_SUMMARY,
        details: details.length ? details : [FALLBACK_SERVER_DETAIL],
      };
    }

    if (payload.message) {
      return {
        summary: payload.title || FALLBACK_ERROR_SUMMARY,
        details: [payload.message],
      };
    }

    if (payload.title) {
      return {
        summary: FALLBACK_ERROR_SUMMARY,
        details: [payload.title],
      };
    }
  }

  if (error.message) {
    return {
      summary: FALLBACK_ERROR_SUMMARY,
      details: [error.message],
    };
  }

  return {
    summary: FALLBACK_ERROR_SUMMARY,
    details: [FALLBACK_SERVER_DETAIL],
  };
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const { summary, details } = parseErrorMessages(error);
        for (const detail of details) {
          messageService.add({
            severity: 'error',
            summary,
            detail,
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
