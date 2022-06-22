import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

const server = express()

server.use(bodyParser.json())

server.use((_, res) => {
  res.json({
    message: 'Hello World!',
  })
})

const startServer = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://sdomianidze:4GMX680AWm6LMtQS@cluster0.8bito.mongodb.net/main?retryWrites=true&w=majority'
    )
    server.listen(8080)
  } catch (err) {
    console.error(err)
  }
}

startServer()
