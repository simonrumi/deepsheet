// see https://stackoverflow.com/questions/69343038/cant-import-the-named-export-xxxx-from-non-ecmascript-module-only-default-expo/70859159
console.log('reading the webpack.config.js file');

const config = {
	mode: 'production', // "production" | "development" | "none"
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
}
 
module.exports = config;