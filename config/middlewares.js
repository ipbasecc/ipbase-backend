module.exports = ({ env }) => [
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'connect-src': ["'self'", 'https:'],
                'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'",'cdn.jsdelivr.net', '*.vantuo.cn','*.aliyuncs.com','*.yihu.team','*.yihu.chat','yihu.chat','*.flame.vip','loaclhost','*.ipbase.cc','*.ipbase.info','*.ipbase.vip','*.ipbase.pro'],
                'img-src': ["'self'", "'unsafe-eval'", 'data:', 'blob:', 'cdn.jsdelivr.net', '*.vantuo.cn','*.aliyuncs.com','*.yihu.team','yihu.chat','*.yihu.chat','*.flame.vip','loaclhost','*.ipbase.cc','*.ipbase.info','*.ipbase.vip','*.ipbase.pro',env("CF_PUBLIC_ACCESS_URL") ? env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, "") : "",],
                "frame-src": [ "self", "sandbox.embed.apollographql.com" ],
                'media-src': [
                    "'self'",
                    'data:',
                    'blob:',
                    'market-assets.strapi.io',
                    env("CF_PUBLIC_ACCESS_URL") ? env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, "") : "",
                ],
                upgradeInsecureRequests: null,
              },
            }
      },
    },
    {
    name: 'strapi::cors',
        config: {
            headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Fingerprint', 'X-Teamid'],
            origin: [
                  'https://yihu.team',
                  'https://yihu.chat',
                  'https://api.yihu.team',
                  'https://www.yihu.team',
                  'https://www.yihu.chat',
                  'https://app.yihu.team',
                  'https://ipbase.cc',
                  'https://www.ipbase.cc',
                  'https://app.ipbase.cc',
                  'https://ipbase.chat',
                  'https://ipbase.info',
                  'https://ipbase.pro',
                  'https://ipbase.vip',
                  'https://www.ipbase.cc',
                  'https://www.ipbase.chat',
                  'https://www.ipbase.info',
                  'https://www.ipbase.pro',
                  'https://www.ipbase.vip',
                  'http://localhost:9000',
                  'http://localhost:9300',
                  'file://'
              ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
        },
    },
    // 'strapi::cors',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
    'global::fingerprint',
];
