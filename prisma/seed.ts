import { hash } from 'bcrypt'
import { prisma } from './db'

async function main() {
  const password = await hash('test', 12)

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'admin',
      password: 'BismillahLaris2025'
    }
  })

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
