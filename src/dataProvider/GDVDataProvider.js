import { ProxyHandlerStatic } from "@comunica/actor-http-proxy";
import config from "../config.json";
import { QueryEngine } from "@comunica/query-sparql";
import {
  getDefaultSession,
  fetch as authFetch,
} from "@inrupt/solid-client-authn-browser";
import { HttpError } from "react-admin";
import { Generator, Parser } from "sparqljs";

const myEngine = new QueryEngine();

let proxyHandler = undefined;
if (config.httpProxy) {
  proxyHandler = new ProxyHandlerStatic(config.httpProxy);
}

if (!config.queryFolder) {
  config.queryFolder = "./";
}

if (config.queryFolder.substring(config.queryFolder.length - 1) !== "/") {
  config.queryFolder = `${config.queryFolder}/`;
}

export default {
  getList: async function getList(queryName, { pagination, sort, filter }) {
    const query = findQueryWithId(queryName);
    query.limit = pagination.perPage;
    query.offset = (pagination.page - 1) * pagination.perPage;
    query.sort = sort;
    let results = await executeQuery(query);
    if (Object.keys(filter).length > 0) {
      results = results.filter((result) => {
        return Object.keys(filter).every((key) => {
          return result[key] === filter[key];
        });
      });
    }
    const totalItems = await query.totalItems;
    return {
      data: results,
      total: parseInt(totalItems),
    };
  },
  getOne: async function getOne() {
    // Our implementation doesn't use this function
    console.log("getOne");
    return {};
  },
  getMany: async function getMany() {
    console.log("getMany");
    return [{}];
  },
  getManyReference: async function getManyReference(
   
  ) {
    console.error("getManyReference not implemented");
  },
  create: async function create() {
    console.error("create not implemented");
  },
  update: async function update() {
    console.error("update not implemented");
  },
  updateMany: async function updateMany() {
    console.error("updateMany not implemented");
  },
  delete: async function deleteOne() {
    console.error("deleteOne not implemented");
  },
  deleteMany: async function deleteMany() {
    console.error("deleteMany not implemented");
  },
};

function findQueryWithId(id) {
  return config.queries.find((query) => query.id === id);
}

/**
 * Fetches the the query file from the given query and returns its text.
 * @param {Object} query the query which is to be executed and additional information about the query.
 * @returns the text from the file location provided by the query relative to query location defined in the config file.
 */
async function fetchQuery(query) {
  try {
    const result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    const parser = new Parser();
    const rawText = await result.text();
    query.rawText = rawText;
    const parsedQuery = parser.parse(rawText);
    if(!parsedQuery.limit){
      parsedQuery.limit = query.limit;
    }
    if(!parsedQuery.offset){
      parsedQuery.offset = query.offset;
    }
    if(!parsedQuery.order && query.sort && query.sort.field !== "id"){
      const {field, order} = query.sort;
      parsedQuery.order = [{expression: {termType: "Variable", value: field}, descending: order === "DESC"}];
    }
    const generator = new Generator();
    return generator.stringify(parsedQuery);
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}

/**
 * A function that executes a given query and processes every result.
 * @param {Object} query the query which is to be executed and additional information about the query.
 * @returns {List<Object>} the results of the query
 */
async function executeQuery(query) {
  try {
    query.queryText = await fetchQuery(query);
    const fetchFunction = getDefaultSession().info.isLoggedIn
      ? authFetch
      : fetch;

    let queryProxyHandler;
    if (query.useProxy) {
      queryProxyHandler = proxyHandler;
    }
    return handleQueryExecution(
      await myEngine.query(query.queryText, {
        sources: query.sources,
        fetch: fetchFunction,
        httpProxyHandler: queryProxyHandler,
      }),
      query
    );
  } catch (error) {
    for (let source of query.sources) {
      myEngine.invalidateHttpCache(source);
    }
    throw new HttpError(error.message, 500);
  }
}

/**
 * A function that given a QueryType processes every result.
 *
 * @param {QueryType} execution a query execution
 * @param {Object} query the query which is to be executed and additional information about the query.
 * @returns {List<Object>} the results of the query
 */
async function handleQueryExecution(execution, query) {
  try {
    let variables;
    const resultType = execution.resultType;

    if (execution.resultType !== "boolean") {
      const metadata = await execution.metadata();
      const totalItems = metadata.totalItems;
      if (!query.totalItems) {
        if (!totalItems) {
          query.totalItems = countQueryResults(query);
        } else {
          query.totalItems = totalItems;
        }
      }
      variables = metadata.variables.map((val) => {
        return val.value;
      });
    }
    return queryTypeHandlers[resultType](await execution.execute(), variables);
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}


/**
 * 
 * @param {Object} query the query which is to be executed and additional information about the query.
 * @returns {List<Object>} the results of the query
 */
async function countQueryResults(query) {
  const parser = new Parser();
  const parsedQuery = parser.parse(query.rawText);
  parsedQuery.queryType = "SELECT";
  parsedQuery.variables = [
    {
      expression: {
        type: "aggregate",
        aggregation: "count",
        expression: { termType: "Wildcard", value: "*" },
        distinct: false,
      },
      variable: { termType: "Variable", value: "totalItems" },
    },
  ];
  const generator = new Generator();
  const countQuery = generator.stringify(parsedQuery);
  const bindings = await myEngine.queryBindings(countQuery, {
    sources: query.sources,
    fetch: fetch,
    httpProxyHandler: proxyHandler,
  });
  return (await bindings.toArray())[0].get("totalItems").value;
}

const queryTypeHandlers = {
  bindings: configureBindingStream,
  quads: configureQuadStream,
  boolean: configureBool,
};

/**
 * Configures how a boolean query gets processed.
 * @param {Boolean} result the result of a boolean query
 */
function configureBool() {
  //
}

/**
 * Configures how a query resulting in a stream of quads should be processed.
 * @param {AsyncIterator<Quad> & ResultStream<Quad>>} quadStream a stream of Quads
 */
async function configureQuadStream(quadStream) {
  try {
    const results = (await quadStream.toArray()).flat();
    return results.map((result, index) => {
      let newResults = {
        subject: result.subject,
        predicate: result.predicate,
        object: result.object,
        graph: result.graph,
        id: index,
      };
      return newResults;
    });
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}

/**
 * Configures how a query resulting in a stream of bindings should be processed.
 * @param {BindingStream} bindingStream a stream of Bindings
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 */
async function configureBindingStream(bindingStream, variables) {
  try {
    const results = await bindingStream.toArray();
    return results.map((result, index) => {
      let newResults = {};
      for (let variable of variables) {
        const value = result.get(variable);
        newResults[variable] = value;
      }
      newResults.id = index;
      return newResults;
    });
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}
