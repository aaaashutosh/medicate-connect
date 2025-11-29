import { connectToDatabase } from './database';
import { User } from './models';
import bcrypt from 'bcrypt';

const demoUsers = [
  {
    name: 'Sagar Bangdel',
    phone: '+977 9876543200',
    email: 'sagar.bangdel@medicate.com',
    password: 'password123',
    role: 'patient',
    profilePicture: 'https://images.pexels.com/photos/4113971/pexels-photo-4113971.jpeg',
  },
  {
    name: 'Sushila Devi Singh',
    phone: '+977 9876543210',
    email: 'sushila.devi.singh@medicateconnect.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Cardiologist',
    experience: 8,
    license: 'MD123456',
    rating: 5,
    isAvailable: true,
    profilePicture: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
  },
  {
    name: 'Admin User',
    phone: '+977 9876543222',
    email: 'admin@medicateconnect.com',
    password: 'password123',
    role: 'admin',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  },
];

async function seedDemoUsers() {
  try {
    await connectToDatabase();

    console.log('Seeding demo users...');

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
          ...userData,
          password: hashedPassword
        });
        await newUser.save();
        console.log(`Created demo user: ${userData.name}`);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.findOneAndUpdate({ email: userData.email }, { password: hashedPassword });
        console.log(`Updated password for demo user: ${userData.name}`);
      }
    }

    console.log('Demo users seeded successfully');
  } catch (error) {
    console.error('Error seeding demo users:', error);
  } finally {
    process.exit(0);
  }
}

seedDemoUsers();
