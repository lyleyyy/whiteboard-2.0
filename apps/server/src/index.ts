import express, { Express } from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
dotenv.config()

const app: Express = express()
const server = createServer(app)
const io = new Server(server, {
  /* options */
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

io.on('connection', (socket) => {
  // ...
  console.log(`🟢 User connected: ${socket.id}`)

  socket.on('joinroom', (userId) => {
    socket.join(userId)
  })

  socket.on('command', (data) => {
    const roomId = data.roomId
    // socket.broadcast.emit("command", command);
    io.to(roomId).emit('command', data)
  })

  socket.on('cursormove', (data) => {
    const { roomId } = data

    io.to(roomId).emit('cursormove', data)
  })

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`)
  })
})

const port = process.env.PORT

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at <http://localhost>:${port}`)
})
