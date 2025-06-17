import express from 'express'
import {
  createRoom,
  getRoomByUserId,
  saveRoomData,
} from '../controllers/room.controller'

export const router = express.Router()

router.get('/room', getRoomByUserId)
router.post('/room', createRoom)
router.put('/room', saveRoomData)
