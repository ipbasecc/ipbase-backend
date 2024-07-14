module.exports = {
    preferenceBase: async () => { 
        let _ = {
            "card_settings": [
              {
                "val": "status",
                "label": "状态",
                "enable": true,
                "description": "显示和设置卡片状态：待处理、处理中、遇阻、待审核、已完成"
              },
              {
                "val": "score",
                "label": "分值",
                "enable": false,
                "description": "管理成员可以为每项任务指定分值，以便后期统计每个成员对项目的共享，关闭后该功能不可用"
              },
              {
                "val": "percent",
                "label": "进度",
                "enable": true,
                "description": "如果卡片是待办类型，那么会在左上角显示已完成待办的进度，你可以在此控制该内容是否显示在卡片上"
              },
              {
                "val": "executor",
                "label": "负责人",
                "enable": true,
                "description": "显示和设置卡片的“负责人”，禁用则不会在卡片上显示"
              },
              {
                "val": "follow",
                "label": "关注",
                "enable": false,
                "description": "显示和设置卡片的“关注”功能，禁用后“关注卡片”功能不可见"
              },
              {
                "val": "color_marker",
                "label": "颜色标签",
                "enable": true,
                "description": "卡片右下角会显示颜色指示灯，仅用该功能将不可用"
              }
            ],
            "enable_settings": [
              {
                "icon": "mdi-chart-bubble",
                "name": "multiple_boards",
                "label": "工作空间",
                "enable": true,
                "description": "允许创建多个工作空间，以便在同一个项目中，管理多个任务管理应用"
              },
              {
                "icon": "forum",
                "name": "chat",
                "label": "讨论",
                "enable": true,
                "description": "讨论模块，由全体项目成员组成的群聊，您也可以发起一对一沟通"
              },
              {
                "icon": "mdi-chart-gantt",
                "name": "kanban",
                "label": "看板",
                "enable": true,
                "description": "展示项目卡片，核心功能，建议开启"
              },
              {
                "icon": "mdi-school",
                "name": "classroom",
                "label": "课堂",
                "enable": false,
                "description": "由看板衍生而来的为“课堂”场景定制的功能模块，您可以以看板的形式展示和管理课程资源"
              },
              {
                "icon": "mdi-film",
                "name": "segment",
                "label": "镜头",
                "enable": false,
                "description": "参考Autodesk Flame的界面，为后期制作团队提供的“镜头制作”管理功能"
              },
              {
                "icon": "mdi-book-open-page-variant",
                "name": "document",
                "label": "文档",
                "enable": true,
                "description": "基于Markdown编辑器的文档功能，您可以在此简单共享文档"
              },
              {
                "icon": "mdi-server-network",
                "name": "storage",
                "label": "文件",
                "enable": true,
                "description": "内置的简易“网盘”，您可以使用我们内置的基于阿里云OSS的存储，也可以使用您自己的Azure Blob存储"
              },
              {
                "icon": "mdi-calendar-clock",
                "name": "schedule",
                "label": "规划",
                "enable": true,
                "description": "简易日程管理工具，您可以创建多个规划日历，并设置其状态，或者共享给外部人员"
              },
            ]
        }
        return _
    }
}