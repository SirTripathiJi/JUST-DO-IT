import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required to seed the database.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_USER_PASSWORD
  const name = process.env.SEED_USER_NAME?.trim()

  if (!email && !password && !name) {
    console.info('No SEED_USER_* variables provided; database seed skipped.')
    return
  }
  if (!email || !password || !name || Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set SEED_USER_EMAIL, SEED_USER_NAME, and a 12–72 byte SEED_USER_PASSWORD together.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const initials = name.split(/\s+/).map((part) => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U'
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, profile: { create: { name, avatarInitials: initials } } },
  })
  console.info(`Seeded configured user: ${email}`)
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
