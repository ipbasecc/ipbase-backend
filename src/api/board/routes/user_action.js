module.exports = {
    routes: [
        {
            "method": "PUT",
            "path": "/projects/:project_id/boards/:board_id/order",
            "handler": "board.groupOrder",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/mattermost/boards",
            "handler": "board.mmCreate",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/mattermost/boards/:mm_channel_id",
            "handler": "board.mmFindOne",
            // "config": {
            //     "auth": true
            // }
        }
    ]
}