import dotenv from 'dotenv';
dotenv.config()

const dev = {
    app: {
        serverPort: process.env.SERVER_PORT || 3001,
        jwtSecretKey: process.env.JWT_SECRET_KEY || 's1t2t3e4o5m6r7p8e9o7d5r3a1a2t4r6a8e0i0l0n0y',
        smtpUserName: process.env.SMTP_USERNAME,
        smtpPassword: process.env.SMTP_PASSWORD,
        clientUrl: process.env.CLIENT_URL,
    },
    db: {
        userAdmin: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/user-admin-db'
    }
}

export default dev;