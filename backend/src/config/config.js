module.exports = {
    development: {
        username: 'root',
        password: '123456',
        database: 'shopback',
        host: process.env.DATABASE_HOST || '127.0.0.1',
        dialect: "mysql",
        port: "3306",
        timezone: "+00:00",
        define: {
            "charset": "utf8",
            "collate": "utf8_general_ci"
        },
        token: {
            secret: 'react',
            expired: '1d'
        },
        errCode: {
            1000: 'User is not exits',
            1001: 'Wrong password',
            1002: 'PERMISSION_DENIED'
        }

    },
    test: {
        "username": "root",
        "password": "123456",
        "database": "shopback",
        host: process.env.DATABASE_HOST || '127.0.0.1',
        "dialect": "mysql",
        "timezone": "+00:00",
        "define": {
            "charset": "utf8",
            "collate": "utf8_general_ci"
        },
        token: {
            secret: 'react',
            expired: '1d'
        },
        errCode: {
            1000: 'User is not exits',
            1001: 'Wrong password',
            1002: 'PERMISSION_DENIED'
        }
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DATABASE_HOST || '127.0.0.1',
        dialect: 'mysql',
        timezone: "+00:00",

        define: {
            charset: "utf8",
            collate: "utf8_general_ci"
        },

        token: {
            secret: 'react',
            expired: '1d'
        },
        errCode: {
            1000: 'User is not exits',
            1001: 'Wrong password',
            1002: 'PERMISSION_DENIED'
        }

    }
};
