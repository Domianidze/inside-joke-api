import mongoose from 'mongoose'
import prompt from 'prompt-async'
import bcrypt from 'bcrypt'
import 'dotenv/config'

import { User } from '../models/index.js'
import { getMongoUrl } from '../util/index.js'

const createUser = async () => {
  try {
    prompt.start()

    const { username, password } = await prompt.get({
      properties: {
        username: {
          pattern: /^\w+$/,
          minLength: 3,
          message: 'username has to be alphanumeric and at least 3 characters',
        },
        password: {
          minLength: 3,
          message: 'password has to contain at least 3 characters',
          hidden: true,
        },
      },
    })

    const database = await mongoose.connect(getMongoUrl())

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      const error = new Error('username is already taken')
      error.statusCode = 422
      throw error
    }
    const hashedPassword = await bcrypt.hash(password, 12)

    const response = await User.create({
      username,
      password: hashedPassword,
    })

    console.log(`user id created with: ${response._id}`)

    database.disconnect()
  } catch (err) {
    console.error(err)
  }
}

createUser()
