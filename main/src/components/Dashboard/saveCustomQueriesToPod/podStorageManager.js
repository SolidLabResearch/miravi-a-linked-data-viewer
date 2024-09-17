import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import configManager from "../../../configManager/configManager";

/**
 * this function puts data on the pod
 * 
 * @param {string} url - url of the pod
 * @param {string} contentType - the type of the content given with data
 * @param {any} data - the data you want to put on the pod
 * @returns a response
 */
export async function addResource(url, contentType, data) {
  const session = getDefaultSession();

  try {

    let response = await session.fetch(url, {
      method: 'PUT',
      headers: { 'content-type': contentType },
      body: data
    })

    if (!response.ok) {
      throw new Error(`Could not fetch the resource${response.status === 401 ? ': Unauthorized' : response.status === 404 ? ': Not Found' : response.statusText}.`);
    }
    return response;

  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

/**
 * this function retrieves data from a pod. This one is finetuned to only let a list of custom queries pass.
 * 
 * @param {string} url - the url of the data you want to retrieve
 * @returns the requested data
 */
export async function getResource(url) {
  const session = getDefaultSession();

  try {

    let response = await session.fetch(url, {
      method: 'GET',
    });


    if (!response.ok) {
      throw new Error(`Could not fetch the resource${response.status === 401 ? ': Unauthorized' : response.status === 404 ? ': Not Found' : response.statusText}.`);
    }

    const contentType = response.headers.get("content-type");
    let content;

    if (contentType.includes("application/json")) {
      // The response must be a json because the query list is.
      content = await response.json();
    } else {
      // If the content type is something else it sure wont be the good resource.
      throw new Error(`Trying to retrieve the wrong type. Must be a JSON containing the queries.`);
    }

    try {
      for (let query of content) {
        
        // Check if all the retrieved objects are valid queries
        if(!configManager.basicQueryFormatValidator(query)){
          throw new Error;
        }
        // The searchparams must be made to enable sharing and editting
        query.searchParams = handleSearchParams(query);
      }

      return content;

    } catch (e) {
      throw new Error("These are no valid custom queries.");
    }


  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

/**
 * Generates the correct searchparams for the given query. This is required for editting and sharing custom queries
 * 
 * @param {object} queryToHandle - the query that has to be checked 
 * @returns the query with correct 'searchparam' parameter
 */
function handleSearchParams(queryToHandle) {

  const copyObject = JSON.parse(JSON.stringify(queryToHandle));

  for (let content in copyObject) {
    if (typeof copyObject[content] === 'object') {
      copyObject[content] = JSON.stringify(copyObject[content]);
    }
  }
  return new URLSearchParams(copyObject);
}

