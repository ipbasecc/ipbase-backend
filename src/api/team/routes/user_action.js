module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/teams/:team_id/invite",
            "handler": "team.genInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/teams/visit_invite/:team_id/:invite_code",
            "handler": "team.visitInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/teams/invite/:team_id/:invite_code",
            "handler": "team.acceptInvite",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/teams/:team_id/remove_user",
            "handler": "team.removeUser",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/teams/:team_id/set_role",
            "handler": "team.setRole",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "POST",
            "path": "/teams/:team_id/leave",
            "handler": "team.leaveTeam",
            // "config": {
            //     "auth": true
            // }
        },
        {
            "method": "GET",
            "path": "/teams/:team_id/documents",
            "handler": "team.findTeamDocuments",
            // "config": {
            //     "auth": true
            // }
        },
        {
          method: 'POST',
          path: '/jitsi/project_meet_auth',
          handler: 'team.projectMeetAuth'
        },
        {
          method: 'GET',
          path: '/teams/:team_id/members',
          handler: 'team.listMembers'
        }
    ]
}