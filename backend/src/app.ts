import { randomUUID } from 'node:crypto'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { HttpError } from './lib/http-error.js'
import { authenticate } from './middleware/authenticate.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.js'
import { taskRouter } from './routes/tasks.js'
import { profileRouter } from './routes/profile.js'
import { habitRouter } from './routes/habits.js'
import { waterRouter } from './routes/water.js'
import { supplementRouter } from './routes/supplements.js'
import { selfCareRouter } from './routes/self-care.js'
import { hobbyRouter } from './routes/hobbies.js'

export const app = express()

app.disable('x-powered-by')
app.set('trust proxy', env.TRUST_PROXY_HOPS)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
}))
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, origin ?? false)
    callback(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed to access the API.'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600,
}))
app.use(express.json({ limit: '1mb', strict: true }))
app.use((req, res, next) => {
  const requestId = randomUUID()
  res.locals.requestId = requestId
  const startedAt = Date.now()
  res.on('finish', () => {
    console.info(JSON.stringify({ level: 'info', requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt }))
  })
  next()
})
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}))

app.get('/api/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ data: { status: 'ok', database: 'connected' } })
})
app.use('/api/auth', authRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/profile', profileRouter)
app.use('/api/habits', habitRouter)
app.use('/api/water', waterRouter)
app.use('/api/supplements', supplementRouter)
app.use('/api/self-care', selfCareRouter)
app.use('/api/hobbies', hobbyRouter)
app.get('/api/protected', authenticate, (req, res) => {
  if (!req.userId) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  res.json({ data: { userId: req.userId } })
})

app.use(notFoundHandler)
app.use(errorHandler)
