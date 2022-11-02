module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/order-details',
     handler: 'order-details.list',
     config: {
       policies: [],
       middlewares: [],
     },
    },    {
     method: 'POST',
     path: '/order-details',
     handler: 'order-details.create',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
