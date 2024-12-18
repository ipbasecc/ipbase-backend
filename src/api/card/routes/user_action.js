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
        },
        {
            "method": "POST",
            "path": "/cards/check_paied",
            "handler": "card.checkPaied",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/discover/cards",
            "handler": "card.queryDiscover",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/buied/cards",
            "handler": "card.queryBuied",
            // "config": {
            //     "auth": false,
            // }
        },
        {
            "method": "GET",
            "path": "/discover/cards/:card_id",
            "handler": "card.queryOneDiscover",
            // "config": {
            //     "auth": false,
            // }
        },
    ]
}