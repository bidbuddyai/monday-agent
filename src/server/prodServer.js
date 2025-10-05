const server = require('./index');
const PORT = process.env.PORT || 8080;

server.set?.('trust proxy', 1);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Monday AI Assistant backend listening on port ${PORT}`);
});
