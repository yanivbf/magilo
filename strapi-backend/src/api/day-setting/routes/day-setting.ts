export default {
  routes: [
    {
      method: 'GET',
      path: '/day-settings',
      handler: 'day-setting.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/day-settings/:id',
      handler: 'day-setting.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/day-settings',
      handler: 'day-setting.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/day-settings/:id',
      handler: 'day-setting.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/day-settings/:id',
      handler: 'day-setting.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
