const nodeExternals = require('webpack-node-externals');

module.exports = {
   externals: [nodeExternals()], // this will cause webpack not to compile the node_modules for the server....this may fix an issue

	// this section is to deal with some files within node_modules that have the extension .mjs but are really just .js files
	// see https://stackoverflow.com/questions/69343038/cant-import-the-named-export-xxxx-from-non-ecmascript-module-only-default-expo/70859159
	resolve: {
		extensions: ['*', '.mjs', '.js', '.json']
	 },
	 module: {
		 rules: [
			 {
				 test: /\.mjs$/,
				 include: [/node_modules/],
				 type: 'javascript/auto'
			 }
		 ]
	 }
};
