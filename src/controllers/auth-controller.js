import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { User } from '../models/index.js'

export const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username })

    if (existingUser) {
      const error = new Error('Username is already taken.')
      error.statusCode = 422
      throw error
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    })

    const response = await user.save()

    res.status(201).json({
      message: 'Registered successfully!',
      userId: response._id,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    res.status(err.statusCode).json({
      message: err.message,
    })
  }
}

export const login = async (req, res) => {
  try {
    const loadedUser = await User.findOne({ username: req.body.username })
    if (!loadedUser) {
      const error = new Error("User with this username doesn't exist.")
      error.statusCode = 404
      throw error
    }
    const correctPassword = await bcrypt.compare(
      req.body.password,
      loadedUser.password
    )
    if (!correctPassword) {
      const error = new Error('Invalid Password')
      error.statusCode = 401
      throw error
    }

    const token = jwt.sign(
      {
        username: loadedUser.username,
        userId: loadedUser.id.toString(),
      },
      '~5N2wZsiGkP;l_+BeK*{>)y"))C[fM',
      { expiresIn: '1h' }
    )

    res.status(200).json({
      token,
      userId: loadedUser.id.toString(),
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    res.status(err.statusCode).json({
      message: err.message,
    })
  }
}
