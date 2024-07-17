import express from "express";
import axios from "axios";
import registry from './registry.json' assert { type: 'json' };
import fs from 'fs';

const router = express.Router();

router.all('/:apiName/:path', (req, res) => {
    // Route request to API
    console.log(req.params.apiName);
    if (registry.services[req.params.apiName]) {
        axios({
            method: req.method,
            url: registry.services[req.params.apiName].url + req.params.path,
            data: req.body,
            headers: req.headers
        }).then((response) => {
            res.send(response.data);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        res.status(404).send("API not found");
    }
});

// Register server endpoint
router.post('/register', (req, res) => {
    const registrationInfo = req.body;
    registrationInfo.url = req.protocol + '://' + registrationInfo.host + ':' + registrationInfo.port + '/';
    if (apiAlreadyExists(registrationInfo)) {
        // Return already exists
        res.send("Configuration already exists for " + registrationInfo.apiName + ' at ' + registrationInfo.host + ':' + registrationInfo.port);
    } else {
        // Register
        if (!registry.services[registrationInfo.apiName]) {
            registry.services[registrationInfo.apiName] = [];
        }

        registry.services[registrationInfo.apiName].push({ ...registrationInfo });
        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.send("Could not register " + registrationInfo.apiName + '\n' + err.message);
            } else {
                res.send("Successfully registered " + registrationInfo.apiName);
            }
        });
    }
})
router.post('/unregister', (req, res) => {
    const registrationInfo = req.body;
    if (apiAlreadyExists(registrationInfo)) {
        // Unregister
        const index = registry.services[registrationInfo.apiName].findIndex((service) => {
            return registrationInfo.url === service.url;
        });
        registry.services[registrationInfo.apiName].splice(index, 1);
        fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err) => {
            if (err) {
                res.send("Could not unregister " + registrationInfo.apiName + err);
            } else {
                res.send("Successfully unregistered " + registrationInfo.apiName);
            }
        });
    } else {
        res.status(404).send("Configuration does not exist for " + registrationInfo.apiName + ' at ' + registrationInfo.url);
    }
})


const apiAlreadyExists = (registrationInfo) => {
    if (!registry.services[registrationInfo.apiName]) {
        return false;
    }

    let exists = false;
    registry.services[registrationInfo.apiName].forEach((service) => {
        if (service.url === registrationInfo.url) {
            exists = true;
            return;
        }
    });
    return exists;
};

export default router;
