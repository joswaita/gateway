import express from 'express';
import dotenv from 'dotenv'

dotenv.config()

// setting up the port
const PORT = process.env.PORT || 3000

const app = express();
app.use(express.json())

app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`)
})
