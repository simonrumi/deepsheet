export async function handler(event, context, callback) {
   console.log('returnTest got event', event, 'context', context);
   return {
      statusCode: 200,
      headers: {
         'Content-Type': 'Content-Type: text/html'
      },
      body: `<html>
      <head>
         <title>redirect test</title>
      </head>
      <body>
         <h1>returned by redirectTest</h1>
         <p>there should be a deepdeepsheettest cookie with the value "foo"</p>
      </body>
      </html>`
   };
}