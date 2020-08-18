exports.handler = function (event, context, callback) {
   //server side functionality
   callback(null, {
      statusCode: 200,
      body: 'Hello world',
   });
};
