import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()


const app = express()

const port = process.env.PORT || 3000

app.use(
  cors({
    origin : "https://localhost:3000",
    credentials:true,
    methods : ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization']
  })
)

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res) => {
  res.send('Hello Varun')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
