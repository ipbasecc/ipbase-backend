module.exports = {
    roleBase: async () => {
        const { schedule } = require('./role_atom/schedule');
        const { schedule_event } = require('./role_atom/schedule-event');
        const role_schedule = schedule();
        const role_schedule_event = schedule_event();
        let role = [
            {
                "role": "creator",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "cover",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": true
                            },
                            {
                                "field": "role",
                                "modify": true
                            },
                            {
                                "field": "manageMember",
                                "modify": true
                            },
                            {
                                "field": "manageRole",
                                "modify": true
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "media",
                                "modify": true
                            },
                            {
                                "field": "start",
                                "modify": true
                            },
                            {
                                "field": "end",
                                "modify": true
                            },
                            {
                                "field": "deadline",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "board", // 对应前端 - “任务”
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
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "storage", // 对应前端 - “文件”
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "score",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
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
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "author",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    role_schedule.creator, // 对应前端 - “规划”
                    role_schedule_event.creator,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.creator.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.creator.fields_permission
                    },
                ]
            },
            {
                "role": "owner",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "cover",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": true
                            },
                            {
                                "field": "role",
                                "modify": true
                            },
                            {
                                "field": "manageMember",
                                "modify": true
                            },
                            {
                                "field": "manageRole",
                                "modify": true
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "media",
                                "modify": true
                            },
                            {
                                "field": "start",
                                "modify": true
                            },
                            {
                                "field": "end",
                                "modify": true
                            },
                            {
                                "field": "deadline",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "score",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
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
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    role_schedule.owner,
                    role_schedule_event.owner,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.owner.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.owner.fields_permission
                    },
                ]
            },
            {
                "role": "executor",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": true
                            },
                            {
                                "field": "manageMember",
                                "modify": true
                            },
                            {
                                "field": "manageRole",
                                "modify": true
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "media",
                                "modify": true
                            },
                            {
                                "field": "start",
                                "modify": true
                            },
                            {
                                "field": "end",
                                "modify": true
                            },
                            {
                                "field": "deadline",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "icon",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": true
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": true
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "score",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            },
                            {
                                "field": "share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": true
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    role_schedule.executor,
                    role_schedule_event.executor,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.executor.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.executor.fields_permission
                    },
                ]
            },
            {
                "role": "reviewer",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "manageRole",
                                "modify": false
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "overview",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "name",
                                "modify": true
                            },
                            {
                                "field": "description",
                                "modify": true
                            },
                            {
                                "field": "media",
                                "modify": false
                            },
                            {
                                "field": "start",
                                "modify": true
                            },
                            {
                                "field": "end",
                                "modify": true
                            },
                            {
                                "field": "deadline",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": false
                            },
                            {
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "score",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            },
                            {
                                "field": "share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "document",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "author",
                                "modify": false
                            }
                        ]
                    },
                    role_schedule.reviewer,
                    role_schedule_event.reviewer,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.reviewer.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.reviewer.fields_permission
                    },
                ]
            },
            {
                "role": "member",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "manageRole",
                                "modify": false
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "media",
                                "modify": false
                            },
                            {
                                "field": "start",
                                "modify": false
                            },
                            {
                                "field": "end",
                                "modify": false
                            },
                            {
                                "field": "deadline",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "score",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
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
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "document",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "author",
                                "modify": false
                            }
                        ]
                    },
                    role_schedule.member,
                    role_schedule_event.member,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.member.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.member.fields_permission
                    },
                ]
            },
            {
                "role": "marster",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "invite_uris",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "manageRole",
                                "modify": false
                            },
                            {
                                "field": "preferences",
                                "modify": true
                            },
                            {
                                "field": "disable_share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "media",
                                "modify": false
                            },
                            {
                                "field": "start",
                                "modify": false
                            },
                            {
                                "field": "end",
                                "modify": false
                            },
                            {
                                "field": "deadline",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "followed_bies",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": true
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "score",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            },
                            {
                                "field": "share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "importance",
                                "modify": true
                            },
                            {
                                "field": "urgency",
                                "modify": true
                            },
                            {
                                "field": "order",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": true
                            },
                            {
                                "field": "color_marker",
                                "modify": true
                            },
                            {
                                "field": "sub_folders",
                                "modify": true
                            }
                        ]
                    },
                    {
                        "collection": "document",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": true
                            },
                            {
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": true
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    role_schedule.marster,
                    role_schedule_event.marster,
                    {
                        "collection": "card_schedule",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule.marster.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": true,
                        "read": true,
                        "modify": true,
                        "fields_permission": role_schedule_event.marster.fields_permission
                    },
                ]
            },
            {
                "role": "external",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "invite_uris",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "manageRole",
                                "modify": false
                            },
                            {
                                "field": "preferences",
                                "modify": false
                            },
                            {
                                "field": "disable_share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "media",
                                "modify": false
                            },
                            {
                                "field": "start",
                                "modify": false
                            },
                            {
                                "field": "end",
                                "modify": false
                            },
                            {
                                "field": "deadline",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "followed_bies",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "score",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "private",
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
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": false,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": false,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "document",
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
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "title",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    role_schedule.external,
                    role_schedule_event.external,
                    {
                        "collection": "card_schedule",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": role_schedule.external.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": false,
                        "fields_permission": role_schedule_event.external.fields_permission
                    },
                ]
            },
            {
                "role": "unconfirmed",
                "ACL": [
                    {
                        "collection": "project",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "cover",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "invite_uris",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "private",
                                "modify": false
                            },
                            {
                                "field": "role",
                                "modify": false
                            },
                            {
                                "field": "manageMember",
                                "modify": false
                            },
                            {
                                "field": "manageRole",
                                "modify": false
                            },
                            {
                                "field": "preferences",
                                "modify": false
                            },
                            {
                                "field": "disable_share",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "overview",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "media",
                                "modify": false
                            },
                            {
                                "field": "start",
                                "modify": false
                            },
                            {
                                "field": "end",
                                "modify": false
                            },
                            {
                                "field": "deadline",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "board",
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
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "group",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "kanban",
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
                                "field": "description",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "icon",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "column",
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
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "storage",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card",
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
                                "field": "type",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "executor",
                                "modify": false
                            },
                            {
                                "field": "followed_bies",
                                "modify": false
                            },
                            {
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "create_version",
                                "modify": false
                            },
                            {
                                "field": "remove_version",
                                "modify": false
                            },
                            {
                                "field": "default_version",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "score",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "private",
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
                    {
                        "collection": "todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "todo",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todogroups",
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
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_todo",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "content",
                                "modify": false
                            },
                            {
                                "field": "status",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "importance",
                                "modify": false
                            },
                            {
                                "field": "urgency",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_storage",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
                            },
                            {
                                "field": "color_marker",
                                "modify": false
                            },
                            {
                                "field": "sub_folders",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "document",
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
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    {
                        "collection": "card_document",
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
                                "field": "jsonContent",
                                "modify": false
                            },
                            {
                                "field": "creator",
                                "modify": false
                            },
                            {
                                "field": "order",
                                "modify": false
                            }
                        ]
                    },
                    role_schedule.unconfirmed,
                    role_schedule_event.unconfirmed,
                    {
                        "collection": "card_schedule",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": role_schedule.unconfirmed.fields_permission
                    },
                    {
                        "collection": "card_schedule_event",
                        "create": false,
                        "delete": false,
                        "read": false,
                        "modify": false,
                        "fields_permission": role_schedule_event.unconfirmed.fields_permission
                    },
                ]
            },
        ]
        return role; 
    }, 
};