import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

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
    return response

  } catch (error) {
    throw new Error(`${error.message}`);
  }
}


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

    return content;

  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

