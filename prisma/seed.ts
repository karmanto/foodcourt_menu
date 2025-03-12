import { hash } from 'bcrypt'
import { prisma } from './db'

async function main() {
  const password = await hash('BismillahLaris2025', 12)
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'admin',
      password,
    },
  })

  const chairsData = Array.from({ length: 100 }, (_, i) => ({
    name: `table${i + 1}`,
  }))

  await prisma.chair.createMany({
    data: chairsData,
  })

  console.log('Seeding selesai!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
