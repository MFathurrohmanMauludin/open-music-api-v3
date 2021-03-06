const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
  constructor(playlistService, songsService, validator) {
    this._playlistService = playlistService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._playlistService.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({

        status: 'success',
        message: 'Playlist berhasil ditambahkan!',
        data: {
          playlistId,
        },

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

      // server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami!',
      });

      response.code(500);
      console.error(error);

      return response;
    }
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      const playlist = await this._playlistService.getPlaylistById(id);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      // server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami!',
      });

      response.code(500);
      console.error(error);

      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistOwner(id, credentialId);
      await this._playlistService.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist anda berhasil dihapus!',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      // server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami!',
      });

      response.code(500);
      console.error(error);

      return response;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._songsService.getSongById(songId);
      await this._playlistService.addSongToPlaylist(playlistId, songId);
      await this._playlistService.addPlaylistActivity(
        playlistId,
        songId,
        credentialId,
        'add',
      );

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan ke playlist!',
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

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      const playlist = await this._playlistService.getPlaylistSongs(id);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
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

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistService.deleteSongFromPlaylist(playlistId, songId);
      await this._playlistService.addPlaylistActivity(
        playlistId,
        songId,
        credentialId,
        'delete',
      );

      return {
        status: 'success',
        message: 'Song berhasil dihapus dari playlist',
      };
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

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      const activities = await this._playlistService.getPlaylistActivity(id);

      return {
        status: 'success',
        data: {
          playlistId: id,
          activities,
        },
      };
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

module.exports = PlaylistHandler;
