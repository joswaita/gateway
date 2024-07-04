import express from "express";
import dotenv from 'dotenv'
dotenv.config()


const PORT = process.env.PORT || 3001
const app = express();
app.use(express.json())
app.get('/fakeapi', (req, res, next) => {
    res.send('hello from fake api')
})

app.get('/bogusApi', (req, res, next) => {
    res.send('hello from bogus api')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})