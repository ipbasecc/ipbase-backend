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
                            },
                            {
                                "field": "statistics",
                                "read": true
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
                            },
                            {
                                "field": "jsonContent",
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
                    },
                    {
                        "collection": "news",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": true
                            },
                            {
                                "field": "cover",
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
                            },
                            {
                                "field": "statistics",
                                "read": false
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
                            },
                            {
                                "field": "jsonContent",
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
                    },
                    {
                        "collection": "news",
                        "create": false,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": false
                            },
                            {
                                "field": "cover",
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
                            },
                            {
                                "field": "statistics",
                                "read": false
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
                            },
                            {
                                "field": "jsonContent",
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
                    },
                    {
                        "collection": "news",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": false
                            },
                            {
                                "field": "cover",
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
                            },
                            {
                                "field": "statistics",
                                "read": false
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
                            },
                            {
                                "field": "jsonContent",
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
                    },
                    {
                        "collection": "news",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": false
                            },
                            {
                                "field": "cover",
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