import { Generator, Parser } from "sparqljs";
import NotImplementedError from "../NotImplementedError";
import { Term } from "sparqljs";

import configManager from "../configManager/configManager";
import comunicaEngineWrapper from "../comunicaEngineWrapper/comunicaEngineWrapper";

let config = configManager.getConfig();

// simple cache to save time while scrolling through pages of a list
// results = the result of executeQuery, totalItems
const listCache = {
  hash: "",
  results: {}
};

// LOG let getListCounter = 0;
// LOG let getVariableOptionsCounter = 0;

export default {
  getList: async function getList(resource, { pagination, sort, filter, meta }) {

    // LOG console.log(`--- getList #${++getListCounter}`);
    // LOG console.log(`resource: ${ resource }`);
    // LOG console.log(`pagination: ${JSON.stringify(pagination, null, 2)}`);
    // LOG console.log(`sort: ${ JSON.stringify(sort, null, 2) }`);
    // LOG console.log(`filter: ${JSON.stringify(filter, null, 2)}`);
    // LOG console.log(`meta: ${JSON.stringify(meta, null, 2)}`);
    
    // make a working copy of the query object found in the configuration, to prevent changing the configuration
    // this copy is extended here
    // rendering should occur based on this working copy
    const query = configManager.getQueryWorkingCopyById(resource);
    const limit = pagination.perPage;
    const offset = (pagination.page - 1) * pagination.perPage;
    query.sort = sort;
    let results = [];
    let totalItems = 0;
    let noSources = false;
    let errorMessage = "";

    try {
      handleComunicaContextCreation(query);

      if (query.sourcesIndex) {
        const additionalSources = await getSourcesFromSourcesIndex(query.sourcesIndex, query.httpProxies);
        query.comunicaContext.sources = [...new Set([...query.comunicaContext.sources, ...additionalSources])];
      }

      if (meta && meta.variableValues) {
        query.variableValues = meta.variableValues;
      }

      const hash = JSON.stringify({ resource, sort, meta, query });
      // LOG console.log(`hash: ${hash}`);
      if (hash == listCache.hash) {
        // LOG console.log(`reusing listCache.results: ${JSON.stringify(listCache.results, null, 2)}`);
        results = listCache.results;
      } else {
        if (query.comunicaContext?.sources?.length) {
          results = await executeQuery(query);
          listCache.hash = hash;
          listCache.results = results;
          // LOG console.log(`new listCache.results: ${JSON.stringify(listCache.results, null, 2)}`);
        } else {
          noSources = true;
        }
      }

      totalItems = results.length;
      results = results.slice(offset, offset + limit);

      if (Object.keys(filter).length > 0) {
        results = results.filter((result) => {
          return Object.keys(filter).every((key) => {
            return result[key] === filter[key];
          });
        });
      }
    } catch (error) {
      // catch all errors here and save the message for meta in the result
      errorMessage = error.message;
    }

    const ret = {
      data: results,
      total: totalItems,
      meta: {
        resultEmpty: !results.length,
        noSources,
        errorMessage
      }
    };
    // LOG console.log(`ret: ${JSON.stringify(ret, null, 2)}`);
    return ret;
  },
  getOne: async function getOne() {
    // Our implementation doesn't use this function
    throw new NotImplementedError();
  },
  getMany: async function getMany() {
    // Our implementation doesn't use this function
    throw new NotImplementedError();
  },
  getManyReference: async function getManyReference() {
    throw new NotImplementedError();
  },
  create: async function create() {
    throw new NotImplementedError();
  },
  update: async function update() {
    throw new NotImplementedError();
  },
  updateMany: async function updateMany() {
    throw new NotImplementedError();
  },
  delete: async function deleteOne() {
    throw new NotImplementedError();
  },
  deleteMany: async function deleteMany() {
    throw new NotImplementedError();
  },
  getVariableOptions,
  clearListCache
};

/**
 * Fetches the query file and builds the final query text.
 * 
 * @param {object} query - the query object working copy
 * @returns {string} the built query text
 */
async function buildQueryText(query) {
  try {
    let rawText = await configManager.getQueryText(query);

    if (rawText === undefined) {
      throw new Error("Invalid query location.")
    }
    if (rawText === null || rawText === '') {
      throw new Error("Empty query text. Check your query and location.")
    }

    if (query.variableValues) {
      rawText = replaceVariables(rawText, query.variableValues);
    }

    query.rawText = rawText;

    if (rawText.includes("?id ") || rawText.includes("$id ")) {
      throw new Error('Variable "id" is not allowed in Miravi queries. Please rename this variable.');
    }

    const parser = new Parser();
    const parsedQuery = parser.parse(rawText);
    if (!query.variableOntology) {
      query.variableOntology = findPredicates(parsedQuery);
    }
    let comments = "";
    if (!parsedQuery.order) {
      comments = "Custom sorting is allowed.";
      if (query.sort && query.sort.field !== "id") {
        const { field, order } = query.sort;
        parsedQuery.order = [
          {
            expression: { termType: "Variable", value: field },
            descending: order === "DESC",
          },
        ];
      }
    } 
    const generator = new Generator();
    let result = generator.stringify(parsedQuery);
    return `# ${comments}\n${result}`;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Replace the variable placeholders in a query's raw text by the specified value.
 * 
 * @param {string} rawText - the raw text of a query.
 * @param {object} variableValues - an object containing the variable names and specified values (as strings).
 * @returns {string} the resulting raw text of the query after replacing the variableValues.
 */
function replaceVariables(rawText, variableValues) {
  for (const [variableName, variableValue] of Object.entries(variableValues)) {
    // do not surround with double quotes here; add double quotes in the input if needed!
    rawText = rawText.replaceAll("$" + variableName, variableValue);
  }

  return rawText;
}

/**
 * Given a query and an object, this function returns the predicates of the object in the query.
 * 
 * @param {object} query - the parsed query in which the predicate is to be looked for.
 * @returns {object} an object with the variable as key and as value an array of predicates.
 */
function findPredicates(query) {
  const ontologyMapper = {};
  if (!query.variables) {
    return query;
  }
  if (query.where) {
    for (const part of query.where) {
      if (part.triples) {
        for (const triple of part.triples) {
          if (triple.predicate.termType !== "Variable") {
            if (!ontologyMapper[triple.object.value]) {
              ontologyMapper[triple.object.value] = [triple.predicate.value];
            } else if (!ontologyMapper[triple.object.value].includes(triple.predicate.value)) {
              ontologyMapper[triple.object.value].push(triple.predicate.value);
            }
          }
        }
      }
    }
  }
  return ontologyMapper;
}

/**
 * Executes the query in scope and processes every result.
 * 
 * @param {object} query - the query object working copy
 * @returns {Array<Term>} the results of the query
 */
async function executeQuery(query) {
  try {
    query.queryText = await buildQueryText(query);
    let variables;
    let results = [];
    let index = 0;
    const callbackVariables = (vars) => {
      variables = vars;
    };
    const callbackBindings = (bindings) => {
      const newResult = {};
      for (const variable of variables) {
        const term = bindings.get(variable);
        newResult[variable] = term;
      }
      newResult.id = index++;
      // LOG console.log(`executeQuery callbackBindings newResult: ${JSON.stringify(newResult, null, 2)}`);
      results.push(newResult);
    };
    const callbackQuads = (quad) => {
      const newResult = {
        subject: quad.subject,
        predicate: quad.predicate,
        object: quad.object,
        graph: quad.graph,
        id: index++
      }
      // LOG console.log(`executeQuery callbackQuads newResult: ${JSON.stringify(newResult, null, 2)}`);
      results.push(newResult);
    };
    const callbackBoolean = (b) => {
      const answer = b ? query?.askQuery?.trueText || "Yes" : query?.askQuery?.falseText || "No";
      const newResult = {
        Answer: {
          termType: "Literal",
          value: answer,
          language: ""
        },
        id: index++
      }
      // LOG console.log(`executeQuery callbackBoolean newResult: ${JSON.stringify(newResult, null, 2)}`);
      results.push(newResult);
    };
    await comunicaEngineWrapper.query(query.queryText,
       // WEIRD: we need to make a copy of the context here (a shallow copy is fine); concurrent calls ???
      { ...query.comunicaContext },
      query.httpProxies && [ ...query.httpProxies ],
      { "variables": callbackVariables, "bindings": callbackBindings, "quads": callbackQuads, "boolean": callbackBoolean });
    return results;
  } catch (error) {
    throw new Error(`Error executing SPARQL query "${query.rawText || query.queryString}": ${error.message}`);
  }
}

/**
 * Gets sources from a sources index
 * 
 * @param {object} sourcesIndex - the sourcesIndex object as found in the configuration
 * @param {array} httpProxies - array of httpProxy definitions
 * @returns {array} array of sources found
 */
async function getSourcesFromSourcesIndex(sourcesIndex, httpProxies) {
  const sourcesList = [];
  try {
    let queryStringIndexSource;
    if (sourcesIndex.queryLocation) {
      const result = await fetch(`${config.queryFolder}${sourcesIndex.queryLocation}`);
      queryStringIndexSource = await result.text();
    } else {
      queryStringIndexSource = sourcesIndex.queryString;
    }

    const bindingsStream = await comunicaEngineWrapper.queryBindings(queryStringIndexSource,
      { lenient: true, sources: [sourcesIndex.url] }, httpProxies, { engine: "link-traversal" });
    const bindingsArray = await bindingsStream.toArray();
    for (const bindings of bindingsArray) {
      // LOG console.log(`getSourcesFromSourcesIndex bindings: ${bindings.toString()}`);
      for (const term of bindings.values()) {  // check for 1st value
        const source = term.value;
        if (!sourcesList.includes(source)) {
          // LOG console.log(`getSourcesFromSourcesIndex adding source: ${source}`);
          sourcesList.push(source);
        }
        // we only want the first term, whatever the variable's name is (note: a for ... of loop seems the only way to access it)
        break;
      }
    }
  }
  catch (error) {
    throw new Error(`Error adding sources from index: ${error.message}`);
  }

  return sourcesList;
}


/**
 * Creates/extends a comunicaContext property in a query
 * 
 * @param {object} query - the query element from the configuration
 */
function handleComunicaContextCreation(query) {
  if (!query.comunicaContext) {
    query.comunicaContext = {
      sources: []
    };
  } else {
    if (!query.comunicaContext.sources) {
      query.comunicaContext.sources = [];
    }
  }

  if (query.sourcesIndex) {
    if (query.comunicaContext.lenient === undefined) {
      query.comunicaContext.lenient = true;
    }
  }
}

async function getVariableOptions(query) {

  function termToSparqlCompatibleString(term) {
    switch (term.termType) {
      case 'NamedNode':
        return `<${term.value}>`;

      case 'Literal':
        const escaped = term.value.replace(/"/g, '\\"');
        if (term.language) {
          return `"${escaped}"@${term.language}`;
        }
        if (term.datatype && term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
          return `"${escaped}"^^<${term.datatype.value}>`;
        }
        return `"${escaped}"`;

      case 'BlankNode':
        return `_:${term.value}`;

      case 'Variable':
        return `?${term.value}`;

      default:
        throw new Error(`Unknown RDF Term type: ${term.termType}`);
    }
  }

  // LOG console.log(`--- getVariableOptions #${++getVariableOptionsCounter}`);

  // BEGIN duplicated chunk of code (duplicated in order for templated queries with indirect queries having sources from a source index to work correctly)
  handleComunicaContextCreation(query);

  if (query.sourcesIndex) {
    const additionalSources = await getSourcesFromSourcesIndex(query.sourcesIndex, query.httpProxies);
    query.comunicaContext.sources = [...new Set([...query.comunicaContext.sources, ...additionalSources])];
  }
  // END duplicated chunk of code

  if (query.comunicaContext.sources.length === 0) {
    throw new Error(`Error getting variable options... No sources found.`);
  }

  let variableOptions;
  let queryStringList = [];

  if (query.variables) {
    variableOptions = query.variables;
  } else {
    variableOptions = {};
  }

  if (query.indirectVariables) {
    if (query.indirectVariables.queryLocations) {

      for (const location of query.indirectVariables.queryLocations) {
        // Checks for a valid queryLocation
        if (!location.endsWith('.rq')) {
          throw new Error("Wrong filetype for the indirectVariables query.")
        }
        const result = await fetch(`${config.queryFolder}${location}`);
        const queryStr = await result.text();

        if (queryStr === null || queryStr === '') {
          throw new Error("Empty variable query text. Check the query and locations for indirectVariables.")
        }
        queryStringList.push(queryStr);
      }
    }
    if (query.indirectVariables.queryStrings) {
      queryStringList = [...queryStringList, ...query.indirectVariables.queryStrings];
    }
    if (queryStringList.length == 0) {
      throw new Error("No indirectVariable queries were given...")
    }
  }

  try {
    for (const queryString of queryStringList) {
      // queryBindings with lenient true to avoid errors with unauthorized sources
      const bindingsStream = await comunicaEngineWrapper.queryBindings(queryString,
        { lenient: true, sources: query.comunicaContext.sources }, query.httpProxies);
      // convert stream to array (works when no bindings found - handling events 'data', 'end' and 'error' does not work when no bindints found)
      const bindingsArray = await bindingsStream.toArray();
      for (const bindings of bindingsArray) {
        // LOG console.log(`getVariableOptions bindings: ${bindings.toString()}`);
        for (const [variable, term] of bindings) {
          const name = variable.value;
          if (!variableOptions[name]) {
            variableOptions[name] = [];
          }
          const variableValue = termToSparqlCompatibleString(term);
          if (variableValue && !variableOptions[name].includes(variableValue)) {
            // LOG console.log(`getVariableOptions adding variable option for '${name}': ${variableValue}`);
            variableOptions[name].push(variableValue);
          }
        }
      }
    }
  }
  catch (error) {
    throw new Error(`Error getting variable options... ${error.message}`);
  }

  if (Object.keys(variableOptions).length === 0) {
    throw new Error(`Error getting variable options... No variable options found.`);
  }

  return variableOptions;
}

/**
 * Clears the list cache
 */
function clearListCache() {
  // LOG console.log('Clearing listCache');
  listCache.hash = "";
}

