import Hapi from 'hapi';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Starting server in ${process.env.NODE_ENV} mode...`);

//lance webpack-dev-server si on est pas en production
if (process.env.NODE_ENV === 'development') require('./dev_server.js')();

const server = new Hapi.Server();
server.connection({port: 8080}),

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => reply.file('./index.html')
});

server.start(() => console.log(`Make it rain! Server started at ${server.info.uri}`));
