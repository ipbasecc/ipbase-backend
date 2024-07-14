module.exports = {
  routes: [
    {
     method: 'PUT',
     path: '/new_follow',
     handler: 'user.addFollw',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

