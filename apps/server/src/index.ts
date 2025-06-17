import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { create, get, loadBoard, updateBoard } from './data/room.repository'
import { signup } from './data/user.repository'
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

app.post('/user', async (req: Request, res: Response) => {
  const { username } = req.body

  try {
    const data = await signup(username)

    res.status(201).json({ data })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
})

app.post('/room', async (req: Request, res: Response) => {
  const { ownerId } = req.body

  try {
    const data = await create(ownerId)
    const newRoom = data[0]

    res.status(201).json({ roomId: newRoom.id })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
})

app.get('/room', async (req: Request, res: Response) => {
  const userId = req.query.userId as string

  try {
    const data = await get(userId)
    const room = data[0]

    res.status(201).json({ roomId: room.id })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
})

app.get('/roomdata', async (req: Request, res: Response) => {
  // const { roomId, ownerId } = req.query
  const { roomId } = req.query

  if (typeof roomId !== 'string') return

  try {
    const data = await loadBoard(roomId)
    if (data) res.status(200).json(data[0])
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
})

app.post('/roomsave', async (req: Request, res: Response) => {
  const { roomId, ownerId, boardLines, boardEllipses } = req.body

  try {
    const data = await updateBoard(roomId, ownerId, boardLines, boardEllipses)
    if (data) res.status(200).json({ message: 'Board status just saved...' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
})

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

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at <http://localhost>:${port}`)
})
