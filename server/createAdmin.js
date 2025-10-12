// // scripts/createAdmin.js
// import mongoose from 'mongoose';
// import { Admin } from './models/admin-model.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const createInitialAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);

//     const existingAdmin = await Admin.findOne({ email: 'admin@counseling.com' });

//     if (!existingAdmin) {
//       await Admin.create({
//         fullName: 'Super Admin',
//         email: 'admin@counseling.com',
//         password: 'Admin123!',
//         role: 'super_admin',
//       });
//       console.log('Initial admin user created successfully');
//     } else {
//       console.log('Admin user already exists');
//     }

//     await mongoose.disconnect();
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//     process.exit(1);
//   }
// };

// createInitialAdmin();

import bcrypt from 'bcrypt';
const password = 'admin@123';
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);
