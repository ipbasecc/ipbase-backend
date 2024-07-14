module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/storages/:storage_id/Azure",
            "handler": "storage.Azure",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/storages/:storage_id/GetImage",
            "handler": "storage.GetImage",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/storages/:storage_id/Download",
            "handler": "storage.Download",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/storages/:storage_id/Upload",
            "handler": "storage.Upload",
            // "config": {
            //     "auth": true
            // }
        }
    ]
}