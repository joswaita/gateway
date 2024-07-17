import express from "express";
import axios from "axios";
import registry from './registry.json' assert { type: 'json' };
import fs from 'fs'

const router = express.Router();
router.all('/:apiName/:path', (req, res) => {
    //route request to api
    console.log(req.params.apiName)
    if (registry.services[req.params.apiName]) {
        axios(
            {
                method: req.method,
                url: registry.services[req.params.apiName].url + req.params.path,
                data: req.body,
                headers: req.headers
            }
        ).then((response) => {
            res.send(response.data)
        })
    } else {
        res.send("API not found")
    }
})

//register server endpoint
router.post('/register', (req, res) => {
    const registrationInfo = req.body;
    registry.services[registrationInfo.apiName] = { ...registrationInfo }
    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
        if (err) {
            res.send("Could not register" + registrationInfo.apiName + '\n' + err)
        } else {
            res.send("Successfully registered" + registrationInfo.apiName)
        }
    })
})

export default router