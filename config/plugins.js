module.exports = () => ({
    "users-permissions": {
    config: {
      register: {
        allowedFields: ["mm_profile"],
      },
      jwt: {
        expiresIn: '7d',
      },
    },
    },
    graphql: {
      config: {
        endpoint: "/graphql",
        shadowCRUD: true,
        playgroundAlways: false,
        artifacts: {
          schema: true,
          typegen: true,
        },
        depthLimit: 28,
        amountLimit: 100,
        apolloServer: {
          tracing: false,
          cache: "bounded",
        },
      },
    },
    mattermost: {
        // name of your plugin, kebab-cased
        enabled: true,
        resolve: "./src/plugins/mattermost", // path to the plugin folder
    },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
          // ... any custom nodemailer options
        },
        settings: {
          defaultFrom: process.env.SMTP_FROM,
          defaultReplyTo: process.env.SMTP_REPLYT,
        },
      },
    },
    io: {
    	enabled: false,
    	config: {
    		socket: {
    			serverOptions: {
    				cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] },
    			},
    		},
    		// This will listen for all supported events on the article content type
    		contentTypes: ['api::kanban.kanban'],
    		events: [
    			{
    				name: 'connection',
    				handler: ({ strapi }, socket) => {
    					// will log every time a client connects
    					strapi.log.info(`[io] a new client with id ${socket.id} has connected`);
    				},
    			},
    		],
    	},
    },
      upload: {
        config: {
          provider: "strapi-provider-upload-oss", // full package name is required
          providerOptions: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            accessKeySecret: process.env.ACCESS_KEY_SECRET,
            region: process.env.REGION,
            bucket: process.env.BUCKET,
            uploadPath: process.env.UPLOAD_PATH,
            baseUrl: process.env.BASE_URL,
            timeout: process.env.TIMEOUT,
            secure: process.env.OSS_SECURE,
          },
        },
      },
    redis: {
      enabled: true,
      config: {
        connections: {
          ipbase: {
            connection: {
              host: '127.0.0.1',
              port: 6379,
              db: 0,
              name: 'ipbase',
            },
            settings: {
              debug: false,
            },
          },
        },
      },
    },
    "rest-cache": {
      enabled: true,
      config: {
        provider: {
          name: "redis",
          options: {
            max: 32767,
            connection: "ipbase",
          },
        },
        strategy: /* @type {CachePluginStrategy} */ {
          keysPrefix: 'ipbase_',
          maxAge: 3600000,
          debug: false,
          contentTypes: [
            {
              contentType: "api::bizcard.bizcard",
              maxAge: 2592000000,
            },
            {
              contentType: "api::bizcard-collection.bizcard-collection",
              maxAge: 2592000000,
            },
            {
              contentType: "api::category.category",
              maxAge: 2592000000,
            },
            {
              contentType: "api::channel.channel",
              maxAge: 2592000000,
            },
            {
              contentType: "api::element.element",
              maxAge: 2592000000,
            },
            {
              contentType: "api::favorite.favorite",
              maxAge: 2592000000,
            },
            {
              contentType: "api::message.message",
              maxAge: 2592000000,
            },
            {
              contentType: "api::popularize.popularize",
              maxAge: 2592000000,
            },
            {
              contentType: "api::post.post",
              maxAge: 2592000000,
            },
            {
              contentType: "api::tag.tag",
              maxAge: 2592000000,
            },
            {
              contentType: "plugin::users-permissions.user",
              maxAge: 2592000000,
            },
            {
              contentType: "api::board.board",
              maxAge: 3600000,
            },
            {
              contentType: "api::card.card",
              maxAge: 3600000,
            },
            {
              contentType: "api::column.column",
              maxAge: 3600000,
            },
            {
              contentType: "api::document.document",
              maxAge: 3600000,
            },
            {
              contentType: "api::group.group",
              maxAge: 3600000,
            },
            {
              contentType: "api::kanban.kanban",
              maxAge: 3600000,
            },
            {
              contentType: "api::member.member",
              maxAge: 3600000,
            },
            {
              contentType: "api::member-role.member-role",
              maxAge: 3600000,
            },
            {
              contentType: "api::overview.overview",
              maxAge: 3600000,
            },
            {
              contentType: "api::project.project",
              maxAge: 3600000,
            },
            {
              contentType: "api::schedule.schedule",
              routes: /* @type {CacheRouteConfig[]} */ [
              {
                path: '/api/schedules/:id', // note that we set the /api prefix here
                method: 'GET', // can be omitted, defaults to GET
                maxAge: 1000,
              },
            ],
            },
            {
              contentType: "api::schedule-event.schedule-event",
              maxAge: 3600000,
            },
            {
              contentType: "api::storage.storage",
              maxAge: 3600000,
            },
            {
              contentType: "api::storage-file.storage-file",
              maxAge: 3600000,
            },
            {
              contentType: "api::team.team",
              maxAge: 3600000,
            },
            {
              contentType: "api::team-channel.team-channel",
              maxAge: 3600000,
            },
            {
              contentType: "api::todo.todo",
              maxAge: 3600000,
            },
            {
              contentType: "api::todogroup.todogroup",
              maxAge: 3600000,
            },
          ],
        },
      },
    },
});
