import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: ["dist/entities/**/*.js"],
    migrations: ["dist/db/migration/**/*.js"],
})

export const connectToDb = async () => {
    let retries = 10
    while (retries) {
        try {
            await AppDataSource.initialize()
            console.log('Connected to DB!')
            break
        } catch (e) {
            console.log('ERROR CONNECT TO DB', e.message)
            retries -= 1

            await new Promise(res => setTimeout(res, 5000))
        }
    }
    if (!retries) {
        console.error("Could not connect to DB after several attempts!")
        process.exit(1)
    }
}
