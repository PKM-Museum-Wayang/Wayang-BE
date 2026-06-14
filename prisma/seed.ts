import 'dotenv/config';
import { DatabaseService } from 'src/database/database.service';
import bcrypt from 'bcrypt';
const db = new DatabaseService();

async function main() {
  await db.admin.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
    },
  });
}

main()
  .catch((error) => {
    console.log(error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
