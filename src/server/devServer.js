const server = require('./index');

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Monday AI Assistant backend listening on port ${PORT}`);
});
