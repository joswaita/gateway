import express from 'express';
import dotenv from 'dotenv'
import routes from './routes/index.js'

dotenv.config()

// setting up the port
const PORT = process.env.PORT || 3000

const app = express();
app.use(express.json())

app.use('/', routes)
app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`)
})
