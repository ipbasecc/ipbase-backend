# IPBase

## Introduction
IPBase is a "Edgeless Collaboration Platform" application that extends from social interaction to collaboration, integrating communication, social networking, project management, and self-media operations. Its design goal is to provide customers with an integrated collaboration platform that overcomes geographical barriers and cognitive gaps, enabling the formation of collaborative teams and realizing team collaboration management, relationship maintenance, and community building.

### Application URLs:
- Mainland China: https://app.yihu.team 
- International Site: https://app.ipbase.cc 

### Demo Video
[Production Introduction Video](https://www.youtube.com/watch?v=xP1KFOq4qN0)

## Application Features
1. **Communication**: Based on Mattermost's communication features, supporting channels, groups, private chats, and other communication methods, with message reply, pin, favorite, and follow functions;
2. **Collaboration**: Supports kanban, classrooms, documents, files, planning, and other collaboration methods, with task management, project management, self-media operations, and other functions;
3. **Social**: Social continuation based on collaboration, aiming to maintain social scenarios related to collaboration;
4. **Self-media Services**: Personal channels can publish articles, videos, audio, etc., and support fan interaction, comments, likes, and other functions;

## Suitable Scenarios
1. **Self-media Teams**: "Fast-paced," "high-output," "cross-regional," and "highly free" are the innate characteristics of self-media teams. The special design of "dispersed communication" in this product is aimed at the issues of "complex information," "fast updates, quick responses, and low certainty" in team communication. You can discuss specific tasks and to-dos separately, and also mark, collect, and pin discussion content. With this product, you can easily plan and decompose tasks, and connect people, events, responsibilities, and outcomes;
2. **Private Domain Operation**: Refer to the functional description below. The platform itself is designed according to the structure of teams, channels, and projects. Each level can achieve independent role and permission control. The deeper the level, the more services it can provide, and it is naturally a sales funnel design. You can guide fans into the team, complete large-scale daily maintenance in public channels, and divert users with specific needs to specific projects to provide personalized services. We will also add payment functions later to realize more commercial scenarios;
3. **Project Management**: You can use the product's features to communicate, schedule, and rate (future version) people, events, and outcomes of teams and projects across regions;
4. **Large Teams**: You can deploy the product to the intranet. If the enterprise is large, you can divide human resources into different teams according to affairs to achieve independent management; you can also divide human resources into different projects to complete internal management, thus preventing the risk of enterprise data leakage.

---

## Feature Description

1. Special Features:
   1. **Dispersed Communication**: Within a project, discussions can be conducted for each card, to-do, and document without discussing all affairs in one discussion window. You can easily find the button to start a discussion on the card interface or the "More" button corresponding to the to-do;
   2. **Enhanced Kanban**: The card UI in the kanban is visually designed according to the "importance" and "urgency" of each card, and it can be switched among "kanban," "list," and "quadrant" forms. In the "quadrant" form, you can intuitively sort all tasks for execution;
   3. **Multi-type Cards**: Each card has three types and can be created or converted as needed, allowing you to manage complex tasks, to-dos, and memos;
   4. **Custom Storage**: You can create your own Azure Blob storage (only for file functions), so you don't have to use the official OSS storage;
   5. **Hybrid Member Private Content**: For kanbans and cards, members can associate their own to-dos to arrange their work privately, and this content is only visible to the members themselves;
2. Structure: Team -> Channels + Projects;
3. Core Features: Projects, including: Discussion, Kanban, Classroom, Document, File, Planning;
   1. Discussion: Inherited from Mattermost features, you can freely create channels and reply to each message, as well as pin, collect, and follow;
   2. Kanban: Organize affairs in the form of cards, with the structure of board -> group -> kanban -> column -> card; each structure can create multiple, cards are divided into task, note, and todo types, and the front end can freely choose to create or convert;
   3. Classroom: A special type of kanban board: classroom, presented on the front end according to the designated UI to display board data, essentially a kanban, and more board types will be established later to meet different scenario needs, thus deriving more functional modules, and a payment module will be added to meet the needs of private domain operations;
   4. Document: A simple document function, Tiptap is introduced for editing and presentation;
   5. File: Team cloud disk, default use OSS, while users can create custom Azure Blob storage, so they can use their own storage services;
   6. Planning: The schedule function completed by ej2 components, if used commercially, pay attention to obtaining official authorization;
   7. Cards:
      1. Types: task - task, note - note, todo - to-do;
      2. Functions: Inherit discussion, kanban, document, file, planning for each card;
   8. Note: Azure storage and planning functions use ej2 components, if used commercially, pay attention to obtaining official authorization or replace them yourself;
4. Permission Judgment: Teams, channels, projects, and cards all have independent permission systems that can be controlled independently. When the permissions at this level are not defined, they will inherit the permissions from the upper level. When the permissions at this level exist, the permissions at this level take precedence.

## Deployment Instructions

1. Deploy Mattermost
   > Please refer to the official documentation: https://docs.mattermost.com/guides/deployment.html 
   > Choose the corresponding plan according to your platform for deployment, note: (a) if using PostgreSQL, be sure to configure the database according to the official steps; (b) if you need to use Mattermost independently and want to use its AI features, you must choose the PostgreSQL database; (c) be sure to configure the reverse proxy correctly, otherwise, the Mattermost websocket service cannot connect to the platform functions and many will not be available
2. Deploy Strapi
   After pulling the backend source code, modify the relevant fields in the configuration file, and then run (you can install dependencies according to your own package management tool)
   ```bash
   yarn
   ```
   Or you can use
   ```
   npm install
   pnpm install
   cnpm install
   ```
   Then run
   ```
   yarn develop
   ```
   Follow the prompts to open the web page, create an administrator account, and prepare for the next configuration
3. Deploy Frontend
   Pull the frontend code and install dependencies (refer to the previous step)
4. Configuration
   Open the .env file in the source code and configure step by step according to the instructions, involving Strapi internal resources, please upload the necessary files in Strapi and obtain the ID after configuring the fields in env, backend configuration must be fully configured according to the instructions in the env file, otherwise, it may cause functional loss or bugs
5. Security Reinforcement
   Please configure Strapi middleware, plugin settings, email configuration, etc., by yourself, for example, you can enable email confirmation for registration, cross-domain settings, registration field restrictions, etc., set Mattermost's cross-domain settings, email configuration, SSL configuration, etc., you can also modify the frontend code to enable Cloudflare's human recognition, which requires you to apply for Cloudflare's related APIs by yourself;
6. Deployment
   > 1. Backend: Upload the source code to the server, execute `yarn build` to compile, and then execute `yarn start` to start the service, you can also use other tools or post-maintenance tools like the Bta panel to manage Node projects;
   > 2. Frontend: Compile locally with `quasar build`, and then upload the files in the corresponding type folder under the dist directory to the server, it is recommended to use `quasar build -m pwa` to package the frontend as a pwa application, so that static resources can be cached locally;
   > 3. Notes: (a) if using an Apache server, pay attention to configuring Vue's routing mode; (b) after deploying Mattermost, be sure to log in to Mattermost first and ensure that the reverse proxy and websocket connections are normal
7. Database Creation Commands: (replace database names, passwords, and other field content by yourself)
   ```bash
   // strapi
    CREATE DATABASE ipbase_strapi WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;

    CREATE USER ipbase_strapi WITH PASSWORD 'Hrt45HGDFr68GjGHFR';
    base_strapi WITH PASSWORD 'Hrt45HGDFr68GjGHFR';

    GRANT ALL PRIVILEGES ON DATABASE ipbase_strapi to ipbase_strapi;

    ALTER DATABASE ipbase_strapi OWNER TO ipbase_strapi;

    GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ipbase_strapi;

    // mattermost
    CREATE DATABASE ipbase_mm WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;

    CREATE USER ipbase_mm WITH PASSWORD 'QstFhjyHRFer4VfBF';

    GRANT ALL PRIVILEGES ON DATABASE ipbase_mm to ipbase_mm;

    ALTER DATABASE ipbase_mm OWNER TO ipbase_mm;

    GRANT USAGE, CREATE ON SCHEMA PUBLIC TO ipbase_mm;
   ```

## Acknowledgements:

- PostgreSQL: https://www.postgresql.org 
- Strapi: https://strapi.io 
- Mattermost: https://mattermost.com 
- Quasar: https://quasar.dev 
- Tiptap: https://tiptap.dev 
- Ej2: https://www.syncfusion.com

