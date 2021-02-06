const { ApolloServer } = require('apollo-server-lambda');
const dbConnector = require('../dbConnector');
const typeDefs = require('../typeDefs');
const resolvers = require('../resolvers');
const { validateUserSession, standardAuthError } = require('./userHelpers');
const { log } = require('./logger');
const { LOG } = require('../../constants');

let cachedServer = null;
const createServer = async () => {
   if (cachedServer) {
      log({ level: LOG.INFO }, 'graphqlHelpers.createServer returning a cachedServer');
      return cachedServer;
   }
   try {
      const startTime = log({ level: LOG.DEBUG, printTime: true }, 'graphqlHelpers.createServer getting db from dbConnector');
      const db = await dbConnector();
      log({ level: LOG.DEBUG, startTime }, 'graphqlHelpers.createServer got db from dbConnector');
      
      const server = new ApolloServer({
         typeDefs,
         resolvers: resolvers(db),
         debug: true,
      });
      log({ level: LOG.INFO }, 'created apollo server');
      cachedServer = server;
      return cachedServer;
   } catch (err) {
      log({ level: LOG.ERROR }, 'not able to connect to db', err.message);
      throw new Error('could not start..sorry :(');
   }
};

/**  withAuth ****
 * this is this guy's solution:
 * https://community.netlify.com/t/middleware-for-serverless-functions/12209
 * but definitely need to read about Proxy to follow what is happening:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/apply
 *
 * withAuth takes a function (func) that in turn takes the event and context args (like all lambda functions)
 * withAuth internally creates the authMiddleware object which contains the apply object, which is a function...
 * that function takes the arguments
 * targetFn - this is going to be func, which was passed into withAuth
 * thisArg - the value of the "this" object
 * args - the args passed to the targetFn, which in this case will be event and context
 * ...the apply function is where we do the authorization, returning an error if it is not authorized
 * otherwise it calls the targetFn (func) with the given args (event & context).
 * To make use of the authMiddleware object a Proxy is created (see MDN link above)
 * Proxy takes a funcntion (in this case func, passed into withAuth), and authMiddleware
 * when proxy.apply is called, the targetFn (func) is intercepted and authMiddleware is run instead
 * authMiddleware however is able to call the targetFn with the arguments intended for it, which we have done
 * after first ensuring the user is authorized
 */
const AUTH_ON = true; // needs to be on in production!

const withAuth = func => async (event, context) => {
   const authMiddleware = {
      apply: async (targetFn, thisArg, args) => {
         if (!AUTH_ON) {
            log({ level: LOG.WARN }, '\n******\nWARNING! Auth is off! Turn on before publishing!\n******\n');
         }

         const startTime = log({ level: LOG.DEBUG, printTime: true }, 'graphqlHelpers.withAuth gettingdb');
         const db = await dbConnector(); // stuff breaks if we don't make sure we have the db connection first
         log({ level: LOG.DEBUG, startTime }, 'graphqlHelpers.withAuth got db');
         
         const event = args[0];
         const context = args[1];
         try {
            const startTime = log({ level: LOG.DEBUG, printTime: true }, 'graphqlHelpers.withAuth about to check authorization');
            const isAuthorized = await validateUserSession(event.headers);
            log({ level: LOG.DEBUG, startTime }, 'graphqlHelpers.withAuth got isAuthorized', isAuthorized);
            
            if (!isAuthorized && AUTH_ON) {
               return standardAuthError;
            }
         } catch (err) {
            log({ level: LOG.ERROR }, 'graphqlHelpers.withAuth error in call to validateUserSession:', err);
            return standardAuthError;
         }
         log({ level: LOG.DEBUG, startTime }, 'graphqlHelpers.withAuth completed the whole middleware function');
         return await targetFn(event, context);
      },
   };
   const proxy = new Proxy(func, authMiddleware);
   return await proxy.apply(this, [event, context]);
};

module.exports = { createServer, withAuth };
