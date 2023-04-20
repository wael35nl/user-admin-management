import bcrypt from 'bcrypt';

const saltRounds = 10;

const securePassword = async (plainPassword) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error);
    }
}

const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.log(error);
    }
}

export { securePassword, comparePassword };