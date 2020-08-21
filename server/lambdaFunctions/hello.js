export async function handler(event, context) {
   console.log('hello world lambda function');
   return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello world from the plain hello.js' }),
   };
}
