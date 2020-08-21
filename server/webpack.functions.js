const nodeExternals = require('webpack-node-externals');

// this will cause webpack not to compile the node_modules for the server....this may fix an issue

module.exports = {
   externals: [nodeExternals()],
};
