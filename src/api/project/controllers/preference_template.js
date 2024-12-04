module.exports = {
    preferenceBase: () => { 
        return [
          {
              "name": "project_settings",
              "label": "project_preference_settings",
              "description": "project_settings_desc",
              "settings": [
                {
                  "val": "allow_join_requests",
                  "label": "project_settings_allow_join_requests_label",
                  "enable": true,
                  "description": "project_settings_allow_join_requests_desc"
                }
              ]
          },
          {
              "name": "kanban_settings",
              "label": "kanban_preference_settings",
              "description": "kanban_settings_desc",
              "settings": [
                {
                  "val": "multiple_boards",
                  "label": "enable_settings_multiple_boards_label",
                  "enable": true,
                  "description": "enable_settings_multiple_boards_desc",
                  "locked_tip": "project_enable_tmpl_multiple_boards_locked_tip"
                }
              ]
          },
          {
              "name": "card_settings",
              "label": "card_preference_settings",
              "description": "card_settings_desc",
              "settings": [
                {
                  "val": "status",
                  "label": "card_settings_status_label",
                  "enable": true,
                  "description": "card_settings_status_desc"
                },
                {
                  "val": "score",
                  "label": "card_settings_score_label",
                  "enable": false,
                  "description": "card_settings_score_desc"
                },
                {
                  "val": "percent",
                  "label": "card_settings_percent_label",
                  "enable": true,
                  "description": "card_settings_percent_desc"
                },
                {
                  "val": "executor",
                  "label": "card_settings_executor_label",
                  "enable": true,
                  "description": "card_settings_executor_desc"
                },
                {
                  "val": "follow",
                  "label": "card_settings_follow_label",
                  "enable": false,
                  "description": "card_settings_follow_desc"
                },
                {
                  "val": "color_marker",
                  "label": "card_settings_color_marker_label",
                  "enable": true,
                  "description": "card_settings_color_marker_desc"
                }
              ]
          },
          {
              "name": "enable_settings",
              "label": "enable_preference_settings",
              "description": "enable_settings_desc",
              "settings": [
                {
                  "icon": "forum",
                  "name": "chat",
                  "label": "enable_settings_chat_label",
                  "enable": true,
                  "description": "enable_settings_chat_description"
                },
                {
                  "icon": "mdi-chart-gantt",
                  "name": "kanban",
                  "label": "enable_settings_kanban_label",
                  "enable": true,
                  "description": "enable_settings_kanban_description"
                },
                {
                  "icon": "mdi-school",
                  "name": "classroom",
                  "label": "enable_settings_classroom_label",
                  "enable": true,
                  "description": "enable_settings_classroom_description"
                },
                {
                  "icon": "mdi-sale",
                  "name": "resource",
                  "label": "enable_settings_resource_label",
                  "enable": true,
                  "description": "enable_settings_resource_description"
                },
                {
                  "icon": "mdi-film",
                  "name": "segment",
                  "label": "enable_settings_segment_label",
                  "enable": true,
                  "description": "enable_settings_segment_description"
                },
                {
                  "icon": "mdi-book-open-page-variant",
                  "name": "document",
                  "label": "enable_settings_document_label",
                  "enable": true,
                  "description": "enable_settings_document_description"
                },
                {
                  "icon": "mdi-server-network",
                  "name": "storage",
                  "label": "enable_settings_storage_label",
                  "enable": true,
                  "description": "enable_settings_storage_description"
                },
                {
                  "icon": "mdi-calendar-clock",
                  "name": "schedule",
                  "label": "enable_settings_schedule_label",
                  "enable": true,
                  "description": "enable_settings_schedule_description"
                },
                {
                  "icon": "mdi-cash",
                  "name": "budget",
                  "label": "enable_settings_budget_label",
                  "enable": true,
                  "description": "enable_settings_budget_description"
                }
              ]
          }
        ]
    }
}