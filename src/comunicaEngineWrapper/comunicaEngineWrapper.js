import { QueryEngine } from "@comunica/query-sparql";
import {
  getDefaultSession,
  fetch as authFetch,
} from "@inrupt/solid-client-authn-browser";

/**
 * A class wrapping a Comunica engine, used for all but login actions.
 */
class ComunicaEngineWrapper {

  static _queryTypeHandlers = {
    bindings: ComunicaEngineWrapper._configureBindingStream,
    quads: ComunicaEngineWrapper._configureQuadStream,
  };

  constructor() {
    this.reset(); 
  }

  /**
   * Resets the engine and all we maintained here about executed queries
   */
  reset() {
    this.engine = new QueryEngine();
    this.fetchSuccess = {};
    this.fetchStatusNumber = {};
    this.underlyingFetchFunction = undefined;
  }

   /**
   * Executes one query
   * 
   * @param {string} queryText - the SPARQL query text
   * @param {object} context - the context to provide to the Comunica engine
   * 
   */
  async query(queryText, context) {
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

      return ComunicaEngineWrapper._handleQueryExecution(await this.engine.query(queryText, context));
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

  /**
   * A function that given a QueryType processes every result.
   * @param {object} execution - a query execution
   * @returns {Array<Term>} the results of the query
   */
  static async _handleQueryExecution(execution) {
    let variables;
    const resultType = execution.resultType;
    if (execution.resultType !== "boolean") {
      const metadata = await execution.metadata();
      variables = metadata.variables.map((val) => {
        return val.value;
      });
    }
    return ComunicaEngineWrapper._queryTypeHandlers[resultType](await execution.execute(), variables);
  }

  /**
   * Configures how a query resulting in a stream of bindings should be processed.
   * @param {object} bindingStream - a stream of Bindings
   * @param {Array<string>} variables - all the variables of the query behind the binding stream.
   * @returns {Array<Term>} the results of the query
   */
  static async _configureBindingStream(bindingStream, variables) {
    const results = await bindingStream.toArray();
    return results.map((result, index) => {
      const newResults = {};
      for (const variable of variables) {
        const value = result.get(variable);
        newResults[variable] = value;
      }
      newResults.id = index;
      return newResults;
    });
  }

  /**
   * Configures how a query resulting in a stream of quads should be processed.
   * @param {object} quadStream - a stream of Quads
   * @returns {Array<Term>} the results of the query
   */
  static async _configureQuadStream(quadStream) {
    const results = (await quadStream.toArray()).flat();
    return results.map((result, index) => {
      const newResults = {
        subject: result.subject,
        predicate: result.predicate,
        object: result.object,
        graph: result.graph,
        id: index,
      };
      return newResults;
    });
  }
}

const comunicaEngineWrapper = new ComunicaEngineWrapper();
export default comunicaEngineWrapper;
