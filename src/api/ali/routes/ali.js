module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/oss',
     handler: 'ali.getStsToken',
    },
    {
     method: 'POST',
     path: '/queryMedias',
     handler: 'ali.queryMedias',
    },
    {
     method: 'POST',
     path: '/addMedia',
     handler: 'ali.addMedia',
    },
  ],
};
