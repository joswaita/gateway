import express from "express";
import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

const HOST = 'localhost'
const PORT = process.env.PORT || 3004
const app = express();
app.use(express.json())
app.get('/fakeapi', (req, res, next) => {
    res.send('hello from fake api')
})

app.get('/bogusApi', (req, res, next) => {
    res.send('hello from bogus api')
})

app.listen(PORT, () => {
    axios(
        {
            method: 'POST',
            url: 'http://localhost:3000/register',
            data: {
                apiName: "fakeApi1",
                protocol: "http",
                host: HOST,
                port: PORT,

            },
            headers: { 'Content-Type': 'application/json' }
        }
    ).then((response) => {
        console.log(response.data)
    }).catch(error => {
        console.log('Error:', error);
    });
    console.log(`Server is running on port ${PORT}`)
})