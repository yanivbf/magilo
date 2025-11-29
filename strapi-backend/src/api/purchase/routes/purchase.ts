export default {
  routes: [
    {
      method: 'GET',
      path: '/purchases',
      handler: 'purchase.find',
    },
    {
      method: 'GET',
      path: '/purchases/:id',
      handler: 'purchase.findOne',
    },
    {
      method: 'POST',
      path: '/purchases',
      handler: 'purchase.create',
    },
    {
      method: 'PUT',
      path: '/purchases/:id',
      handler: 'purchase.update',
    },
    {
      method: 'DELETE',
      path: '/purchases/:id',
      handler: 'purchase.delete',
    },
  ],
};
