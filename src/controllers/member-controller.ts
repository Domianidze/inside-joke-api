import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import mongoose from 'mongoose'

import { Member } from '../models'
import { memberSchema } from '../schemas'
import { ErrorType } from '../types'
import { getDefaultImagePath, getImagePath } from '../util'

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await memberSchema.validateAsync(req.body)

    if(!req.body.avatarUrl) {
      req.body.avatarUrl = getDefaultImagePath()
    }

    const response = await Member.create(req.body)

    res.status(201).json({
      message: 'Member added successfully!',
      memberId: response._id,
    })
  } catch (err) {
    next(err)
  }
}

export const changeAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Member.findById(req.body.memberId)

    if(!req.file) {
      const error: ErrorType = new Error("Proper image is required.")
      error.statusCode = 422
      throw error
    }

    if (!member) {
      fs.unlinkSync(req.file.path)
      
      const error: ErrorType = new Error("Member with this id not found.")
      error.statusCode = 404
      throw error
    }

    if(member.avatarUrl) {
      const path = getImagePath(member.avatarUrl)
      fs.unlinkSync(path)
    }

    member.avatarUrl = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/${req.file.path}`

    await member.save()

    res.status(200).json({
      message: 'Avatar changed successfully!',
    })
  } catch (err) {
    next(err)
  }
}

export const editMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await memberSchema.validateAsync(req.body)

    const member = await Member.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.body.id),
      },
      req.body
    )

    if (!member) {
      const error: ErrorType = new Error('No member found with this id')
      error.statusCode = 404
      throw error
    }

    res.status(201).json({
      message: 'Member updated successfully!',
    })
  } catch (err) {
    next(err)
  }
}

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Member.findByIdAndRemove(req.body.id)

    if (!member) {
      const error: ErrorType = new Error('No member found with this id.')
      error.statusCode = 404
      throw error
    }

    if(member.avatarUrl && member.avatarUrl !== getDefaultImagePath()) {
      const path = getImagePath(member.avatarUrl)
      fs.unlinkSync(path)
    }

    res.status(200).json({
      message: 'Member deleted successfully!',
    })
  } catch (err) {
    next(err)
  }
}