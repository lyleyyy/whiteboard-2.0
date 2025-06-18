import { Request, Response } from 'express'
import { create, get, updateBoard } from '../data/room.repository'

export async function createRoom(req: Request, res: Response) {
  const { ownerId } = req.body

  try {
    const data = await create(ownerId)
    const newRoom = data[0]

    res.status(201).json({ roomId: newRoom.id })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
}

export async function getRoomById(req: Request, res: Response) {
  const roomId = req.query.roomId as string

  try {
    const data = await get(roomId)
    const room = data[0]

    res.status(201).json({ room })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
}

// export async function loadRoomData(req: Request, res: Response) {
//   const { roomId } = req.query

//   if (typeof roomId !== 'string') return

//   try {
//     const data = await loadBoard(roomId)
//     if (data) res.status(200).json(data[0])
//   } catch (err) {
//     res.status(500).json({ message: 'Internal Error' })
//   }
// }

export async function saveRoomData(req: Request, res: Response) {
  const { roomId, ownerId, boardLines, boardEllipses, boardTexts } = req.body

  try {
    const data = await updateBoard(
      roomId,
      ownerId,
      boardLines,
      boardEllipses,
      boardTexts
    )
    if (data) res.status(200).json({ message: 'Board status just saved...' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
}
