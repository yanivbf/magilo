export default {
  routes: [
    {
      method: 'GET',
      path: '/leads',
      handler: 'lead.find',
    },
    {
      method: 'GET',
      path: '/leads/:id',
      handler: 'lead.findOne',
    },
    {
      method: 'POST',
      path: '/leads',
      handler: 'lead.create',
    },
    {
      method: 'PUT',
      path: '/leads/:id',
      handler: 'lead.update',
    },
    {
      method: 'DELETE',
      path: '/leads/:id',
      handler: 'lead.delete',
    },
  ],
};
