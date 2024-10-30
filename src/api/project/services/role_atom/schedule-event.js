module.exports = {
    schedule_event: () => {
        let _ACL = {
            "creator": {
                "collection": "schedule_event",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": true
                    },
                    {
                        "field": "time",
                        "modify": true
                    },
                    {
                        "field": "location",
                        "modify": true
                    },
                    {
                        "field": "description",
                        "modify": true
                    },
                ]
            },
            "owner": {
                "collection": "schedule_event",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": true
                    },
                    {
                        "field": "time",
                        "modify": true
                    },
                    {
                        "field": "location",
                        "modify": true
                    },
                    {
                        "field": "description",
                        "modify": true
                    },
                ]
            },
            "executor": {
                "collection": "schedule_event",
                "create": true,
                "delete": true,
                "read": true,
                "modify": true,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": true
                    },
                    {
                        "field": "time",
                        "modify": true
                    },
                    {
                        "field": "location",
                        "modify": true
                    },
                    {
                        "field": "description",
                        "modify": true
                    },
                ]
            },
            "reviewer": {
                "collection": "schedule_event",
                "create": false,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
            "member": {
                "collection": "schedule_event",
                "create": false,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
            "master": {
                "collection": "schedule_event",
                "create": true,
                "delete": false,
                "read": true,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
            "external": {
                "collection": "schedule_event",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
            "unconfirmed": {
                "collection": "schedule_event",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
            "blocked": {
                "collection": "schedule_event",
                "create": false,
                "delete": false,
                "read": false,
                "modify": false,
                "fields_permission": [
                    {
                        "field": "subject",
                        "modify": false
                    },
                    {
                        "field": "time",
                        "modify": false
                    },
                    {
                        "field": "location",
                        "modify": false
                    },
                    {
                        "field": "description",
                        "modify": false
                    },
                ]
            },
        }

        return _ACL
    }
}