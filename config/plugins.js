module.exports = ({ env }) => ({
    "users-permissions": {
        config: {
          register: {
            allowedFields: ["mm_profile"],
          },
          jwt: {
            expiresIn: '7d',
          },
          grantConfig: {
            wechat: {
              enabled: true,
              icon: 'wechat',
              key: env('WECHAT_APP_ID'),
              secret: env('WECHAT_APP_SECRET'),
              callback: '/api/connect/wechat/callback',
              scope: ['snsapi_login'],
              transport: 'session',
              state: true
            }
          }
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
            // 配置正确的 body parser 选项
            // 在 GraphQL 请求中，Apollo Server 和 koa-bodyparser 都在尝试读取请求体，导致了冲突。
            // 这样配置：
            // 1. 保持了 body parser 的功能
            // 2. 设置了合理的限制
            // 3. 允许处理不同类型的请求体
            // 4. 避免了与 koa-bodyparser 的冲突
            bodyParserConfig: {
              limit: '10mb', // 设置了整体请求体大小限制
              formLimit: '10mb', // 表单数据的大小限制
              jsonLimit: '10mb', // JSON 数据的大小限制
              textLimit: '10mb', // 文本数据的大小限制
              multipart: true, // 支持多部分请求
            }
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
    	enabled: true,
    	config: {
    		socket: {
    			serverOptions: {
    				cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] },
    			},
    		},
    		hooks: {
                init({ io }) {
                  strapi.log.info(`ws working`);
                },
            },
    		// This will listen for all supported events on the article content type
    		contentTypes: [],
    		events: [
    			{
    				name: 'connection',
    				// handler: ({ strapi }, socket) => {
    				// 	// will log every time a client connects
    				// 	strapi.log.info(`[io] a new client with id ${socket.id} has connected`);
    				// },
    				handler: async ({ strapi }, socket) => {
    				    strapi.socket = socket;
    				    const publish = (event, rooms, data) => {
    				        strapi.$io.raw({
        				        event: event,
        				        rooms: rooms,
        				        data: data
        				    });
    				    }
    				    strapi.$publish = publish
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
    // upload: {
    //     config: {
    //       provider: "strapi-provider-cloudflare-r2",
    //       providerOptions: {
    //         accessKeyId: env("CF_ACCESS_KEY_ID"),
    //         secretAccessKey: process.env.CF_ACCESS_SECRET,
    //         /**
    //          * `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
    //          */
    //         endpoint: process.env.CF_ENDPOINT,
    //         params: {
    //           Bucket: process.env.CF_BUCKET,
    //         },
    //         /**
    //          * Set this Option to store the CDN URL of your files and not the R2 endpoint URL in your DB.
    //          * Can be used in Cloudflare R2 with Domain-Access or Public URL: https://pub-<YOUR_PULIC_BUCKET_ID>.r2.dev
    //          * This option is required to upload files larger than 5MB, and is highly recommended to be set.
    //          * Check the cloudflare docs for the setup: https://developers.cloudflare.com/r2/data-access/public-buckets/#enable-public-access-for-your-bucket
    //          */
    //         cloudflarePublicAccessUrl: process.env.CF_PUBLIC_ACCESS_URL,
    //         /**
    //          * Sets if all assets should be uploaded in the root dir regardless the strapi folder.
    //          * It is useful because strapi sets folder names with numbers, not by user's input folder name
    //          * By default it is false
    //          */
    //         pool: false,
    //       },
    //       actionOptions: {
    //         upload: {},
    //         uploadStream: {},
    //         delete: {},
    //       },
    //     },
    // },
    redis: {
      enabled: false,
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
      enabled: false,
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
              routes: /* @type {CacheRouteConfig[]} */ [
                  {
                    path: '/api/users-permissions/user/me/init', // note that we set the /api prefix here
                    method: 'GET', // can be omitted, defaults to GET
                    maxAge: 2592000000,
                  },
              ],
            },
            {
              contentType: "api::board.board",
              maxAge: 3600000,
            },
            {
              contentType: "api::card.card",
              maxAge: 3600000,
              routes: /* @type {CacheRouteConfig[]} */ [
                  {
                    path: '/api/cards', // note that we set the /api prefix here
                    method: 'GET', // can be omitted, defaults to GET
                    maxAge: 3600000,
                  },
                  {
                    path: '/api/follows', // note that we set the /api prefix here
                    method: 'GET', // can be omitted, defaults to GET
                    maxAge: 3600000,
                  },
              ],
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
