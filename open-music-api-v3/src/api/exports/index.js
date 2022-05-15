const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'export',
  version: '3.0.0',
  register: async (server, { producerService, playlistService, validator }) => {
    const exportHandler = new ExportHandler(
      producerService,
      playlistService,
      validator,
    );
    server.route(routes(exportHandler));
  },
};
