module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/follows",
            "handler": "card.findFollowed",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/cards/:card_id/share/:storage_id",
            "handler": "card.findShareCardStorage",
            // "config": {
            //     "auth": false,
            // }
        }
    ]
}