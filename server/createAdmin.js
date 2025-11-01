
import bcrypt from 'bcrypt';
const password = 'admin@123';
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);
