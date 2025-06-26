import "reflect-metadata"
import express from "express"
import {connectToDb} from "./db/data-source"
import "reflect-metadata"
import "dotenv/config"
import userRoutes from "./routes/UserRoutes"

const app = express()
app.use(express.json())

const setRoutes = () => {
    app.use('/api/users', userRoutes)
}

const serverInit = async () => {
    await connectToDb()
    app.use(express.json())
    setRoutes()
    const PORT = process.env.PORT || 4000
    app.use(express.json())

    app.listen(PORT, () => {
        console.log(`Server is running on port:${PORT}`)
    })
}
serverInit()
