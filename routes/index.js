import express from "express";
import axios from "axios";
import registry from './registry.json' assert { type: 'json' };
import fs from 'fs';
import loadBalancer from "../utils/loadBalancer.js";

const router = express.Router();

router.post('/enableDisable/:apiName', (req, res) => {
    const { apiName } = req.params;
    const requestBody = req.body
    const instances = registry.services[apiName].instances
    const index = instances.findIndex((instance) => { return instance.url === requestBody.url })
    if (index === -1) {
        res.status(404).send("Instance not found")
    } else {
        instances[index].enabled = requestBody.enabled
        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.send("Could not enable/disable instance ");
            } else {
                res.send("Instance enabled/disabled successfully");
            }
        });
    }
})

router.all('/:apiName/:path', (req, res) => {
    const service = registry.services[req.params.apiName];
    if (service) {
        if (!service.loadBalanceStrategy) {
            service.loadBalanceStrategy = "ROUND_ROBIN";
            fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
                if (err) {
                    res.send("Could not write load balance strategy ");
                } else {
                    res.send("Load balance strategy writeen successfully");
                }
            });
        }
        const newIndex = loadBalancer[service.loadBalanceStrategy]
            (service);
        const url = service.instances[newIndex].url + req.params.path;
        axios({
            method: req.method,
            url: url,
            data: req.body,
            headers: req.headers
        }).then((response) => {
            res.send(response.data);
        }).catch((error) => {
            console.log(error);
            res.status(500).send(error.message);
        });
    } else {
        res.status(404).send("API not found");
    }
});

router.post('/register', (req, res) => {
    const registrationInfo = req.body;
    registrationInfo.url = req.protocol + '://' + registrationInfo.host + ':' + registrationInfo.port + '/';

    if (apiAlreadyExists(registrationInfo)) {
        res.send("Configuration already exists for " + registrationInfo.apiName + ' at ' + registrationInfo.host + ':' + registrationInfo.port);
    } else {
        if (!registry.services[registrationInfo.apiName]) {
            registry.services[registrationInfo.apiName] = {
                loadBalanceStrategy: "ROUND_ROBIN",
                index: 0,
                instances: []
            };
        }

        registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo });
        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.status(500).send("Could not register " + registrationInfo.apiName + '\n' + err.message);
            } else {
                res.send("Successfully registered " + registrationInfo.apiName);
            }
        });
    }
});

router.post('/unregister', (req, res) => {
    const registrationInfo = req.body;
    if (apiAlreadyExists(registrationInfo)) {
        const index = registry.services[registrationInfo.apiName].instances.findIndex((service) => {
            return registrationInfo.url === service.url;
        });
        registry.services[registrationInfo.apiName].instances.splice(index, 1);
        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.status(500).send("Could not unregister " + registrationInfo.apiName + '\n' + err.message);
            } else {
                res.send("Successfully unregistered " + registrationInfo.apiName);
            }
        });
    } else {
        res.status(404).send("Configuration does not exist for " + registrationInfo.apiName + ' at ' + registrationInfo.url);
    }
});

const apiAlreadyExists = (registrationInfo) => {
    if (!registry.services[registrationInfo.apiName]) {
        return false;
    }

    return registry.services[registrationInfo.apiName].instances.some(service => service.url === registrationInfo.url);
};

export default router;
