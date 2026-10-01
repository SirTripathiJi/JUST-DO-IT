import { Prisma } from '../generated/prisma/client.js'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../lib/http-error.js'

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}.`))
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details, requestId } })
    return
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        requestId,
      },
    })
    return
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'The requested resource was not found.', requestId } })
    return
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with those values already exists.', requestId } })
    return
  }
  console.error(JSON.stringify({ level: 'error', requestId, method: req.method, path: req.path, errorType: error instanceof Error ? error.name : 'UnknownError' }))
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
      requestId,
    },
  })
}
