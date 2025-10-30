import 'dotenv/config';

export const appSettings = {
    appName: process.env.APP_NAME,
    development: JSON.parse(process.env.DEVELOPMENT || 'false'),
    timeZone: process.env.TIME_ZONE,
    timeZoneMongoDB: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        getCurrentTime() {
            return new Date().toLocaleString('en-US', { timeZone: appSettings.timeZone });
        },
        getCustomTime(time: string) {
            return new Date(time).toLocaleString('en-US', { timeZone: appSettings.timeZone });
        }
    },
    sessionSecret: process.env.SESSION_SECRET,
    mainLanguage: process.env.MAIN_LANGUAGE,
    port: process.env.PORT,
    maxFileSize: {
        admin: Number(process.env.MAX_FILE_SIZE_ADMIN),
        front: Number(process.env.MAX_FILE_SIZE_FRONT),
    },
    prefixApi: process.env.PREFIX_API,
    corsOrigin: [
        process.env.CORS_ORIGIN_FE1,
        process.env.CORS_ORIGIN_FE2,
    ],
    mongo: {
        url: process.env.MONGO_URL,
        dbName: process.env.DB_NAME,
    },
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    issuer: process.env.ISSUER,
    expireIn: process.env.EXPIRE_IN,
    refreshExpireIn: process.env.REFRESH_EXPIRE_IN,
    apiKey: process.env.API_KEY,
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
    },
};