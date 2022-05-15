require('dotenv').config();

const path = require('path');

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');

// ALBUM
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// SONG
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// USER
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// AUTHENTICATIONS
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// PLAYLISTS
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// COLLABORATIONS
const collaboration = require('./api/collaboration');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// EXPORTS
const _exports = require('./api/exports');
const ExportValidator = require('./validator/exports');

// UPLOADS
const uploads = require('./api/uploads');
const UploadsService = require('./services/postgres/UploadsService');
const UploadsValidator = require('./validator/uploads');

// ALBUM LIKES
const albumlikes = require('./api/albumlikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

// PRODUCER
const ProducerService = require('./services/rabbitmq/ProducerService');

// STORAGE
const StorageService = require('./services/storage/StorageService');

// CACHE
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(
    collaborationService,
    cacheService,
  );
  const uploadsService = new UploadsService();
  const albumlikesService = new AlbumLikesService(cacheService);


  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan authentication strategy jwt
  server.auth.strategy('openmusicsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        storageService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        playlistService,
        songsService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaboration,
      options: {
        collaborationService,
        playlistService,
        usersService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService: ProducerService,
        playlistService,
        validator: ExportValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: uploadsService,
        storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: albumlikes,
      options: {
        service: albumlikesService,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
