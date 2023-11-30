require('dotenv').config();

module.exports = {
  openSearchConfig: {
    node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
    auth: {
      username: process.env.OPENSEARCH_USERNAME,
      password: process.env.OPENSEARCH_PASSWORD,
    },
  },
  serverConfig: {
    port: process.env.PORT || 4040,
  },
};
