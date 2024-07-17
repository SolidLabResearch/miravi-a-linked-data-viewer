import { QueryEngine } from "@comunica/query-sparql";
import {
  getDefaultSession,
  fetch as authFetch,
} from "@inrupt/solid-client-authn-browser";

/**
 * A class wrapping a Comunica engine, used for all but login actions.
 */
class ComunicaEngineWrapper {

  constructor() {
    this.engine = new QueryEngine();
    this.fetchSuccess = {};
    this.fetchStatusNumber = {};
    this.underlyingFetchFunction = undefined;
  }

  /**
   * Resets the engine and all we maintained here about executed queries
   */
  reset() {
    this.engine.invalidateHttpCache();
    this.fetchSuccess = {};
    this.fetchStatusNumber = {};
    this.underlyingFetchFunction = undefined;
  }

   /**
   * Executes one SPARQL query with the Comunica engine
   * 
   * Support the following callback functions. Forward only the ones you need.
   * - "variables": will be called once with an array of variable names, in case of a SELECT query
   * - "bindings": will be called for all bindings, in case of a SELECT query
   * - "quads": will be called for every quad, in case of a CONSTRUCT query
   * - "boolean": will be called for the resulting boolean, in case of an ASK query
   * 
   * @param {string} queryText - the SPARQL query text
   * @param {object} context - the context to provide to the Comunica engine
   * @param {object} callbacks - an object contains the callback functions you specifiy
   */
  async query(queryText, context, callbacks) {
    try {
      // avoid faulty fetch status for sources cached in Comunica
      for (const source of context.sources) {
        this.fetchSuccess[source] = true;
      }
      this.underlyingFetchFunction = fetch;
      if (getDefaultSession().info.isLoggedIn) {
        this.underlyingFetchFunction = authFetch;
      }
      context.fetch = ComunicaEngineWrapper._statusFetch(this.underlyingFetchFunction, this);

      let result = await this.engine.query(queryText, context);
      switch (result.resultType) {
        case 'bindings':
          const metadata = await result.metadata();
          const variables = metadata.variables.map((val) => {
            return val.value;
          });
          if (callbacks["variables"]) {
            callbacks["variables"](variables);
          }
          const bindingsStream = await result.execute();
          await new Promise((resolve, reject) => {
            if (callbacks["bindings"]) {
              bindingsStream.on('data', (bindings) => {
                callbacks["bindings"](bindings);
              });
            }
            bindingsStream.on('end', resolve);
            bindingsStream.on('error', reject);
          });
          break;
        case 'quads':
          const quadStream = await result.execute();
          await new Promise((resolve, reject) => {
            if (callbacks["quads"]) {
              quadStream.on('data', (quad) => {
                callbacks["quads"](quad);
              });
            }
            quadStream.on('end', resolve);
            quadStream.on('error', reject);
          });
          break;
        case 'boolean':
          const answer = await result.execute();
          if (callbacks["boolean"]) {
            callbacks["boolean"](answer);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      this.reset();
      throw error;
    }
  }

  /**
   * Given a fetch function and an object, returns a function that wraps the fetch function and sets the fetch success information in member variables of the object.
   * @param {Function} customFetch - a fetch function to be wrapped.
   * @param {object} obj - the object
   * @returns {Function} that function.
   */
  static _statusFetch(customFetch, obj) {
    const wrappedFetchFunction = async (arg) => {
      try {
        const response = await customFetch(arg, {
          headers: {
            Accept: "application/n-quads,application/trig;q=0.9,text/turtle;q=0.8,application/n-triples;q=0.7,*/*;q=0.1"
          }
        });
        obj.fetchSuccess[arg] = response.ok;
        obj.fetchStatusNumber[arg] = response.status;
        return response;
      }
      catch (error) {
        obj.fetchSuccess[arg] = false;
        throw error;
      }
    }

    return wrappedFetchFunction;
  }

}

const comunicaEngineWrapper = new ComunicaEngineWrapper();
export default comunicaEngineWrapper;
