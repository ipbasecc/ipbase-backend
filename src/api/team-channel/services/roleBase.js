module.exports = {
    roleBase: async () => { 
        let role = [
            {
                "role": "admin",
                "ACL": [
                    {
                        "collection": "channel",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "manageMember",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
            {
                "role": "member",
                "ACL": [
                    {
                        "collection": "channel",
                        "create": false,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    }
                ]
            },
            {
                "role": "unconfirmed",
                "ACL": [
                    {
                        "collection": "channel",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "invite_uris",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    }
                ]
            },
            {
                "role": "blocked",
                "ACL": [
                    {
                        "collection": "channel",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "invite_uris",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    }
                ]
            },
        ]
        return role; 
    }, 
};