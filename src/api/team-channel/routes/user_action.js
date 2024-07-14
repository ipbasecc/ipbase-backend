module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/team-channels/:channel_id/invite",
            "handler": "team-channel.genInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/team-channels/visit_invite/:channel_id/:invite_code",
            "handler": "team-channel.visitInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/team-channels/invite/:channel_id/:invite_code",
            "handler": "team-channel.acceptInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/team-channels/:channel_id/remove_user",
            "handler": "team-channel.removeUser",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/team-channels/:channel_id/set_role",
            "handler": "team-channel.setRole",
            // "config": {
            //     "auth": true
            // }
        },
    ]
}