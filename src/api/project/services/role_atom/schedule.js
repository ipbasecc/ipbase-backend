module.exports = {
    schedule: () => {
        let _ACL = {
            "creator": {
                "collection": "schedule",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": true
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": true
                    },
                    {
                        "field": "type",
                        "modify": true
                    },
                    {
                        "field": "schedule_events",
                        "modify": true
                    },
                    {
                        "field": "order",
                        "modify": true
                    },
                    {
                        "field": "share",
                        "modify": true
                    }
                ]
            },
            "owner": {
                "collection": "schedule",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": true
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": true
                    },
                    {
                        "field": "type",
                        "modify": true
                    },
                    {
                        "field": "schedule_events",
                        "modify": true
                    },
                    {
                        "field": "order",
                        "modify": true
                    },
                    {
                        "field": "share",
                        "modify": true
                    }
                ]
            },
            "executor": {
                "collection": "schedule",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": true
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": true
                    },
                    {
                        "field": "type",
                        "modify": true
                    },
                    {
                        "field": "schedule_events",
                        "modify": true
                    },
                    {
                        "field": "order",
                        "modify": true
                    },
                    {
                        "field": "share",
                        "modify": true
                    }
                ]
            },
            "reviewer": {
                "collection": "schedule",
                "create": false,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": false
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": false
                    },
                    {
                        "field": "type",
                        "modify": false
                    },
                    {
                        "field": "schedule_events",
                        "modify": false
                    },
                    {
                        "field": "order",
                        "modify": false
                    },
                    {
                        "field": "share",
                        "modify": false
                    }
                ]
            },
            "member": {
                "collection": "schedule",
                "create": false,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": false
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": false
                    },
                    {
                        "field": "type",
                        "modify": false
                    },
                    {
                        "field": "schedule_events",
                        "modify": false
                    },
                    {
                        "field": "order",
                        "modify": false
                    },
                    {
                        "field": "share",
                        "modify": false
                    }
                ]
            },
            "marster": {
                "collection": "schedule",
                "create": true,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": false
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": false
                    },
                    {
                        "field": "type",
                        "modify": false
                    },
                    {
                        "field": "schedule_events",
                        "modify": false
                    },
                    {
                        "field": "order",
                        "modify": false
                    },
                    {
                        "field": "share",
                        "modify": false
                    }
                ]
            },
            "external": {
                "collection": "schedule",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": false
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": false
                    },
                    {
                        "field": "type",
                        "modify": false
                    },
                    {
                        "field": "schedule_events",
                        "modify": false
                    },
                    {
                        "field": "order",
                        "modify": false
                    },
                    {
                        "field": "share",
                        "modify": false
                    }
                ]
            },
            "unconfirmed": {
                "collection": "schedule",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "name",
                        "modify": false
                    },
                    {
                        "field": "share", // 对应 passcode 字段，填写密码后可以通过密码访问
                        "modify": false
                    },
                    {
                        "field": "type",
                        "modify": false
                    },
                    {
                        "field": "schedule_events",
                        "modify": false
                    },
                    {
                        "field": "order",
                        "modify": false
                    },
                    {
                        "field": "share",
                        "modify": false
                    }
                ]
            },
        }

        return _ACL
    }
}