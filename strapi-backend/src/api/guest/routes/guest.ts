export default {
  routes: [
    {
      method: 'GET',
      path: '/guests',
      handler: 'guest.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/guests/:id',
      handler: 'guest.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/guests',
      handler: 'guest.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/guests/:id',
      handler: 'guest.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/guests/:id',
      handler: 'guest.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
