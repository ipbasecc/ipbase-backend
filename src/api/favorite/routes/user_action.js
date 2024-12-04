module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/me/favorites",
            "handler": "favorite.queryItems",
            // "config": {
            //     "auth": true
            // }
        }
    ]
}