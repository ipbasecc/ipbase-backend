module.exports = {
    preferenceBase: () => { 
        return {
          "card_settings": [
            {
              "val": "status",
              "label": "card_settings_status_label",
              "enable": true,
              "description": "card_settings_status_label"
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
          ],
          "enable_settings": [
            {
              "icon": "mdi-chart-bubble",
              "name": "multiple_boards",
              "label": "enable_settings_multiple_boards_label",
              "enable": false,
              "description": "enable_settings_multiple_boards_desc"
            },
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
            }
          ]
        }
    }
}