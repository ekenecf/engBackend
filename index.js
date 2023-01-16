import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'

import authRoute from './routes/auth.js'
import userRoute from './routes/user.js'
import textRoute from './routes/text.js'

dotenv.config({ path: './utils/config.env' })

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())

const DB = process.env.DATABASE

mongoose.set("strictQuery", false);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Db connect success!!'))


app.use('/auth', authRoute)
app.use('/users', userRoute)
app.use('/text', textRoute)

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500
  const errorMessage = err.message || 'Something went wrong!'
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  })
})

app.listen(process.env.PORT || 1000, () => {
  console.log('connected to port...!!')
})
