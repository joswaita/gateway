import express from "express";
import axios from "axios";
import registry from './registry.json' assert { type: 'json' };

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

export default router