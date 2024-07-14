module.exports = {
    routes: [
        {
            "method": "PUT",
            "path": "/messages/:id/like",
            "handler": "message.like",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "PUT",
            "path": "/messages/:id/unlike",
            "handler": "message.unlike",
            // "config": {
            //     "auth": false,
            // }
        },
    ]
}