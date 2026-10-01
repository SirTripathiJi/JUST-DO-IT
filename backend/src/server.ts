import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'

async function start() {
  await prisma.$connect()
  const server = app.listen(env.PORT, () => {
    console.info(JSON.stringify({ level: 'info', message: 'API listening', port: env.PORT, environment: env.NODE_ENV }))
  })

  let shuttingDown = false
  const shutdown = (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    console.info(JSON.stringify({ level: 'info', message: 'API shutting down', signal }))
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0))
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch(async (error: unknown) => {
  console.error(JSON.stringify({ level: 'fatal', message: 'API failed to start', errorType: error instanceof Error ? error.name : 'UnknownError' }))
  await prisma.$disconnect()
  process.exitCode = 1
})
