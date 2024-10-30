module.exports = {
    routes: [
        {
            "method": "POST",
            "path": "/contacts/process_friend",
            "handler": "contact.processFriend",
        },
        {
            "method": "POST",
            "path": "/contacts/process_request",
            "handler": "contact.processRequest",
        },
        {
            "method": "POST",
            "path": "/contacts/check_blocked",
            "handler": "contact.checkBlocked",
        },
    ]
}