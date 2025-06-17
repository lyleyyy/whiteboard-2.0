import express, { Express } from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { createUser } from './controllers/user.controller'
import {
  createRoom,
  getRoomByUserId,
  loadRoomData,
  saveRoomData,
} from './controllers/room.controller'
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

app.post('/user', createUser)

app.get('/room', getRoomByUserId)
app.post('/room', createRoom)
app.get('/roomdata', loadRoomData)
app.post('/roomdata', saveRoomData)

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`)

  socket.on('joinroom', (userId) => {
    socket.join(userId)
  })

  socket.on('command', (data) => {
    const roomId = data.roomId

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

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at <http://localhost>:${port}`)
})
