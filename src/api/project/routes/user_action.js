module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/projects/:project_id/invite",
            "handler": "project.genInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/projects/visit_invite/:project_id/:invite_code",
            "handler": "project.visitInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/projects/invite/:project_id/:invite_code",
            "handler": "project.acceptInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/projects/:project_id/remove_user",
            "handler": "project.removeUser",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/projects/:project_id/set_role",
            "handler": "project.setRole",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/mattermost/projects/:mm_channel_id",
            "handler": "project.mmFindOne",
            // "config": {
            //     "auth": true
            // }
        }
    ]
}