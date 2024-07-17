import express from 'express';
import dotenv from 'dotenv'
import routes from './routes/index.js'
import helmet from 'helmet';

dotenv.config()

// setting up the port
const PORT = process.env.PORT || 3000

const app = express();
app.use(express.json())
app.use(helmet())

app.use('/', routes)
app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`)
})
