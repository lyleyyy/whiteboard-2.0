import express from 'express'
import {
  createRoom,
  getRoomById,
  saveRoomData,
} from '../controllers/room.controller'

export const router = express.Router()

router.get('/room', getRoomById)
router.post('/room', createRoom)
router.put('/room', saveRoomData)
