export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics',
      handler: 'analytic.find',
    },
    {
      method: 'GET',
      path: '/analytics/:id',
      handler: 'analytic.findOne',
    },
    {
      method: 'POST',
      path: '/analytics',
      handler: 'analytic.create',
    },
    {
      method: 'PUT',
      path: '/analytics/:id',
      handler: 'analytic.update',
    },
    {
      method: 'DELETE',
      path: '/analytics/:id',
      handler: 'analytic.delete',
    },
  ],
};
