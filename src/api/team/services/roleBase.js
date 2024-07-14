module.exports = {
    roleBase: async () => { 
        let role = [
            {
                "role": "admin",
                "ACL": [
                    {
                        "collection": "team",
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
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        "collection": "project",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true
                    }
                ]
            },
            {
                "role": "member",
                "ACL": [
                    {
                        "collection": "team",
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
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        "collection": "project",
                        "create": false,
                        "delete": false,
                        "read": true,
                        "modify": false
                    }
                ]
            },
            {
                "role": "unconfirmed",
                "ACL": [
                    {
                        "collection": "team",
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
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        "collection": "project",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false
                    }
                ]
            },
            {
                "role": "blocked",
                "ACL": [
                    {
                        "collection": "team",
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
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        "collection": "project",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false
                    }
                ]
            },
        ]
        return role; 
    }, 
};