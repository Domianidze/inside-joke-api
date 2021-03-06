import { Request, Response, NextFunction } from 'express'
import fs from 'fs'

import { Band } from '../models'
import { setInformationSchema } from '../schemas'
import { ErrorType } from '../types'
import { getDefaultImagePath, getImagePath } from '../util'

export const getBandData = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const band = await Band.findOne().select('-_id -__v')

    if(!band) {
      const error: ErrorType = new Error("Band not found.")
      error.statusCode = 404
      throw error
    }

    res.json(band)
  } catch (err) {
    next(err)
  }
}

export const setBandLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const band = await Band.findOne()

    if(!req.file) {
      const error: ErrorType = new Error("Proper image is required.")
      error.statusCode = 422
      throw error
    }

    if(!band) {
      fs.unlinkSync(req.file.path)

      const error: ErrorType = new Error("Band not found.")
      error.statusCode = 404
      throw error
    }

    if(band.logoUrl && band.logoUrl !== getDefaultImagePath('band')) {
      const path = getImagePath(band.logoUrl)

      if(fs.existsSync(path)) {
        fs.unlinkSync(path)
      } 
    }

    band.logoUrl = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/${req.file.path}`

    await band.save()

    res.status(201).json({
      message: 'Logo set successfully!',
    })
  } catch (err) {
    next(err)
  }
}

export const setBandInformation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await setInformationSchema.validateAsync(req.body)

    const band = await Band.findOneAndUpdate(req.body)

    if (!band) {
      const error: ErrorType = new Error('Band not found.')
      error.statusCode = 404
      throw error
    }

    res.status(201).json({
      message: 'Information set successfully!',
    })
  } catch (err) {
    next(err)
  }
}