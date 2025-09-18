const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminRole() {
  try {
    const result = await prisma.user.updateMany({
      where: { email: 'admin@logeera.com' },
      data: { role: 'ADMIN' },
    });

    console.log('✅ Admin role set successfully!');
    console.log('Updated users:', result.count);

    // Verify the update
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@logeera.com' },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log('Admin user details:', adminUser);
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminRole();
