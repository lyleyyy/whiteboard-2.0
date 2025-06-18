import { Request, Response } from 'express'
import { signup } from '../data/user.repository'

export async function createUser(req: Request, res: Response) {
  const { username } = req.body

  try {
    const data = await signup(username)

    res.status(201).json({ data })
  } catch (err) {
    res.status(500).json({ message: 'Internal Error' })
  }
}
