module.exports = {
    roleBase: async () => { 
        let role = [
            {
                "role": "creator",
                "collection_permission": [
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
                                "field": "manageRole",
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
                                "field": "startTime",
                                "modify": true
                            },
                            {
                                "field": "endTime",
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
                            {
                                "field": "isAllDay",
                                "modify": true
                            },
                            {
                                "field": "recurrenceRule",
                                "modify": true
                            },
                            {
                                "field": "recurrenceException",
                                "modify": true
                            },
                            {
                                "field": "recurrenceID",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
            {
                "role": "executor",
                "collection_permission": [
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
                                "field": "manageRole",
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
                        "collection": "schedule_event",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "subject",
                                "modify": true
                            },
                            {
                                "field": "startTime",
                                "modify": true
                            },
                            {
                                "field": "endTime",
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
                            {
                                "field": "isAllDay",
                                "modify": true
                            },
                            {
                                "field": "recurrenceRule",
                                "modify": true
                            },
                            {
                                "field": "recurrenceException",
                                "modify": true
                            },
                            {
                                "field": "recurrenceID",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
            {
                "role": "member",
                "collection_permission": [
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
                                "field": "manageRole",
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
                                "modify": true
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
                                "modify": true
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
                                "modify": true
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
                                "field": "author",
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
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
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
                        "collection": "schedule_event",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "subject",
                                "modify": true
                            },
                            {
                                "field": "startTime",
                                "modify": true
                            },
                            {
                                "field": "endTime",
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
                            {
                                "field": "isAllDay",
                                "modify": true
                            },
                            {
                                "field": "recurrenceRule",
                                "modify": true
                            },
                            {
                                "field": "recurrenceException",
                                "modify": true
                            },
                            {
                                "field": "recurrenceID",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
            {
                "role": "reviewer",
                "collection_permission": [
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
                                "field": "manageRole",
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
                                "modify": true
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
                                "field": "author",
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
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
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
                        "collection": "schedule_event",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "subject",
                                "modify": true
                            },
                            {
                                "field": "startTime",
                                "modify": true
                            },
                            {
                                "field": "endTime",
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
                            {
                                "field": "isAllDay",
                                "modify": true
                            },
                            {
                                "field": "recurrenceRule",
                                "modify": true
                            },
                            {
                                "field": "recurrenceException",
                                "modify": true
                            },
                            {
                                "field": "recurrenceID",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
            {
                "role": "marster",
                "collection_permission": [
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
                                "modify": true
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
                                "field": "manageRole",
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
                                "modify": true
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
                                "field": "author",
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
                        "modify": false,
                        "fields_permission": [
                            {
                                "field": "files",
                                "modify": false
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
                        "collection": "schedule_event",
                        "create": true,
                        "delete": false,
                        "read": true,
                        "modify": true,
                        "fields_permission": [
                            {
                                "field": "subject",
                                "modify": true
                            },
                            {
                                "field": "startTime",
                                "modify": true
                            },
                            {
                                "field": "endTime",
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
                            {
                                "field": "isAllDay",
                                "modify": true
                            },
                            {
                                "field": "recurrenceRule",
                                "modify": true
                            },
                            {
                                "field": "recurrenceException",
                                "modify": true
                            },
                            {
                                "field": "recurrenceID",
                                "modify": true
                            }
                        ]
                    }
                ]
            },
        ]
        return role; 
    }, 
};