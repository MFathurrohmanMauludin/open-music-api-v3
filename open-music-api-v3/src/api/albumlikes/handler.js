const ClientError = require('../../exceptions/ClientError');

class AlbumLikesHandler {
  constructor(service) {
    this._service = service;

    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikesHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id } = request.params;

      const message = await this._service.addAlbumLikes(id, credentialId);

      const response = h.response({
        status: 'success',
        message,
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami!',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    try {
      const { id } = request.params;

      const { likes, isCache } = await this._service.getAlbumLikes(id);

      return h
        .response({
          status: 'success',
          data: {
            likes,
          },
        })
        .header('X-Data-Source', isCache ? 'cache' : 'db');
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami!',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumLikesHandler;
