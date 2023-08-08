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
    let results = await executeQuery(query);
    let originalSize = results.length;
    if (Object.keys(filter).length > 0) {
      results = results.filter((result) => {
        return Object.keys(filter).every((key) => {
          return result[key] === filter[key];
        });
      });
    }
    const { page, perPage } = pagination;
    const start = (page - 1) * perPage;
    if (start > results.length) {
      results = [];
    } else if (start + perPage > results.length - 1) {
      results = results.slice(start, results.length);
    } else {
      results = results.slice(start, start + perPage);
    }
    return {
      data: results,
      total: await query.totalItems,
    };
  },
  getOne: async function getOne(_, { id }) {
    console.log("getOne");
    return executeQuery(findQueryWithId(id));
  },
  getMany: async function getMany(_, { ids }) {
    console.log("getMany");
    return {
      data: await Promise.all(
        executeQuery(ids.map((id) => findQueryWithId(id)))
      ),
    };
  },
  getManyReference: async function getManyReference(
    _,
    { target, id },
    __,
    ___
  ) {
    console.error("getManyReference not implemented");
  },
  create: async function create(_, { data }) {
    console.error("create not implemented");
  },
  update: async function update(_, { id, data }) {
    console.error("update not implemented");
  },
  updateMany: async function updateMany(_, { ids, data }) {
    console.error("updateMany not implemented");
  },
  delete: async function deleteOne(_, { id }) {
    console.error("deleteOne not implemented");
  },
  deleteMany: async function deleteMany(_, { ids }) {
    console.error("deleteMany not implemented");
  },
};

function findQueryWithId(id) {
  return config.queries.find((query) => query.id === id);
}

function findQueryByName(name) {
  return config.queries.find((query) => query.name === name);
}

/**
 * Fetches the the query file from the given query and returns its text.
 * @param {query} query the query which is to be executed
 * @returns the text from the file location provided by the query relative to query location defined in the config file.
 */
async function fetchQuery(query) {
  try {
    const result = await fetch(`${config.queryFolder}${query.queryLocation}`);
    const parser = new Parser();
    const rawText = await result.text();
    query.rawText = rawText;
    const parsedQuery = parser.parse(rawText);
    parsedQuery.limit = query.limit;
    parsedQuery.offset = query.offset;
    const generator = new Generator();
    return generator.stringify(parsedQuery);
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}

/**
 * A function that executes a given query and processes every result.
 * @param {query} query the query which is to be executed
 */
async function executeQuery(query) {
  try {
    query.queryText = await fetchQuery(query);
    const fetchFunction = getDefaultSession().info.isLoggedIn
      ? authFetch
      : fetch;
    return handleQueryExecution(
      await myEngine.query(query.queryText, {
        sources: query.sources,
        fetch: fetchFunction,
        httpProxyHandler: proxyHandler,
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
 * @param {query} query the query which is being executed
 */
async function handleQueryExecution(execution, query) {
  try {
    let variables;
    const resultType = execution.resultType;

    console.log(execution);
    if (execution.resultType === "bindings") {
      const metadata = await execution.metadata();
      const totalItems = metadata.totalItems;
      if(!query.totalItems) {
        if(!totalItems){
          query.totalItems = countQueryResults(query);
        }
        else{
          query.totalItems = totalItems;
        }
      }
      variables = metadata.variables.map((val) => {
        return val.value;
      });
    }
    return queryTypeHandlers[execution.resultType](
      await execution.execute(),
      variables
    );
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}

async function countQueryResults(query) {
  const parser = new Parser();
  const parsedQuery = parser.parse(query.rawText);
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
function configureBool(result) {
  //
}

/**
 * Configures how a query resulting in a stream of quads should be processed.
 * @param {AsyncIterator<Quad> & ResultStream<Quad>>} quadStream a stream of Quads
 * @param {List<String>} variables all the variables of the query behind the binding stream.
 */
async function configureQuadStream(quadStream) {
  try {
    const results = (await quadStream.toArray()).flat();
    return results.map((result, index) => {
      let newResults = {
        subject: result.subject.id,
        predicate: result.predicate.id,
        object: result.object.id,
        graph: result.graph.id,
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
        let value = result.get(variable);
        if (value) {
          value = value.id ? value.id : value.value;
        }
        newResults[variable.split("_")[0]] = value;
      }
      newResults.id = index;
      return newResults;
    });
  } catch (error) {
    throw new HttpError(error.message, 500);
  }
}
