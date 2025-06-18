import express, { Express } from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import cors from 'cors'
import { router as userRouter } from './routes/user.router'
import { router as roomRouter } from './routes/room.router'
import socketServer from './socket/socket'

dotenv.config()

const app: Express = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

app.use('/', userRouter)
app.use('/', roomRouter)

socketServer(server)

const port = process.env.PORT

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at <http://localhost>:${port}`)
})
