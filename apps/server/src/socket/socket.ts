import { Server, Socket } from 'socket.io'
import type { Server as HTTPServer } from 'http'

function socketServer(server: HTTPServer) {
  const io = new Server(server, {
    /* options */
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
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
}

export default socketServer
