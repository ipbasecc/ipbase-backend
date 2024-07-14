module.exports = {
    routes: [
        {
            "method": "PUT",
            "path": "/elements/:id/viewed",
            "handler": "element.viewed",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "PUT",
            "path": "/elements/:id/favorite/:favorite_id",
            "handler": "element.favorite",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "PUT",
            "path": "/elements/:id/like",
            "handler": "element.like",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "PUT",
            "path": "/elements/:id/unlike",
            "handler": "element.unlike",
            // "config": {
            //     "auth": false,
            // }
        },
    ]
}