# Generic Data Viewer React Admin

This Web app allows users to easily execute queries over multiple data sources (including Solid pods) and
inspect the corresponding results.

Table of contents:

* [Preface](#preface)
* [Getting started](#getting-started)
* [The supporting resources](#the-supporting-resources)
* [Static, production build](#static-production-build)
* [Logging in](#logging-in)
* [Configuration file](#configuration-file)
  * [Specifying sources](#specifying-sources)
  * [Adding variable type](#adding-variable-type)
  * [Templated queries](#templated-queries)
    * [Templated queries with fixed values for the template variables](#templated-queries-with-fixed-values-for-the-template-variables)
    * [Templated queries with values for the template variables to be derived from the data](#templated-queries-with-values-for-the-template-variables-to-be-derived-from-the-data)
  * [Query icons](#query-icons)
* [Custom queries](#custom-queries)
* [Representation Mapper](#representation-mapper)
* [Using the local pods](#using-the-local-pods)
* [Testing](#testing)
  * [Testing the production version](#testing-the-production-version)
  * [Testing the development version](#testing-the-development-version)

## Preface

This repository defines a Web application in the directory `main` and some auxiliary tools for testing and supporting a demo in the directory `test`.

## Getting started

The application is located in directory `main`.
Go to that directory.

To install the application:

```bash
npm install
```

To run the Web application in development mode:

```bash
npm run dev
```

Now you can browse the displayed URL.

If you want to test the queries provided in the default configuration `main/src/config.json`,
continue in section [The supporting resources](#the-supporting-resources).

## The supporting resources

The supporting resources, including a local pod containing example data, are located in directory `test`.

To install, go to directory `test` and execute:

```bash
npm install
```

Next, activate the supporting resources by executing each of the following steps
in a new terminal window, also in directory `test`:

1. Prepare and start the local pods:

   ```bash
   npm run reset:pods && npm run start:pods
   ```

2. Start the http proxy:

   ```bash
   npm run start:proxy
   ```

3. Start a server which denies all CORS headers:

   ```bash
   npm run start:badCors
   ```

Some queries require a log in.
Log in with the IDP `http://localhost:8080` and the credentials for the user owning the pod named `example` in the file `test/seeded-pod-config.json`.

## Static, production build

To make a standalone version of the result of this project, you can make a static build and serve it using any webserver.

In directory `main`, execute:

```bash
npm run build
```

The static build appears in directory `main/dist`.

## Logging in

Some queries access data sources that are only readable by authenticated users. This requires you to log in.
To log in, you need to provide an Identity Provider or a WebID.
The application will detect which one you use and redirect you to the login page of your Identity Provider.
If you provide a WebID, the first Identity Provider found in the given WebID is used.

## Configuration file

The configuration file `main/src/config.json` follows a simple structure.

```json
{
  "title": "Title shown at the top of the app.",
  "logoLocation": "Image location of the logo shown at the top of the app (relative to public folder.).",
  "logoRedirectURL": "The URL the Web application redirects to when a user clicks on the logo.",
  "mainAppColor": "The main colors used in the app, can be any CSS color.",
  "backgroundColor": "Background color of the app, can be any CSS color.",
  "titleColor": "The color of the title, can be any CSS color",
  "textColor": "The color of all the text in teh app body, this means all text except header and footer.",
  "footer": "HTML components or text that will function as the footer (will be placed in the footer div.)",
  "defaultIDP": "The default value used for IDP when logging in, this IDP can be manually changed in the Web app as well. ",
  "queryFolder": "The base location of the queries, all query locations will start from this folder (relative to public folder.)",
  "httpProxy": "The http proxy through which the requests will be rerouted. When left empty, the Comunica query engine will handle it. This is useful when CORS headers are not set (correctly) on the queried source.",
  "introductionText": "The text that the app shows on the dashboard, which the app also shows when you first open it.",
  "queryGroups" : [
    {
      "id": "A unique ID for the query group",
      "name": "A name for the query group",
      "icon": "The key to the icon for the query group. This is optional and a default menu icon will be used when left empty."
    }
  ],
  "queries": [
    {
      "id": "A unique ID for the query. This ID appears in the URL of the displayed result. Queries are ordered in the menu according to ascending ID.",
      "queryGroupId": "ID of the query group too which this query belongs. If not given, the query is displayed outside existing groups.",
      "queryLocation": "Path to the query location, relative to 'queryFolder'",
      "name": "A name for the query",
      "description": "Description of the query",
      "icon": "The key to the icon for the query. This is optional and a default menu icon will be used when left empty.",
      "comunicaContext": {
        "sources": "Initial list of sources over which the query should be executed",
        "useProxy": "True or false, whether the query should be executed through the proxy or not. This field is optional and defaults to false.",
        ... any other field that can be used in the Comunica query engine https://comunica.dev/docs/query/advanced/context/
      },
      "sourcesIndex": {
        "url": "URL of the publicly available RDF resource acting as an index file for more sources over which the query should be executed",
        "queryLocation": "Path to the location, relative to 'queryFolder', of the (auxiliary) query that yields the sources from above RDF resource"
      },
      "variables": {
        "variableExampleString": ["\"String1\"", "\"String2\""],
        "variableExampleUri": ["<https://example.com/uri1>", "<https://example.com/uri2>"],
        "variableExampleInteger": ["1", "2"]
      },
      "indirectVariables": {
        "queryLocations": [
          "Path to the location, relative to 'queryFolder' of a query yielding some template variable values",
          ...
        ]
      },

      "askQuery": {
        "trueText": "The text that is to be shown when the query result is true (in ASK queries).",
        "falseText": "The text that is to be shown when the query result is false (in ASK queries)."
      }
    },
    ... etc
  ]
}
```

### Specifying sources

The set of sources over which a query will be executed is derived from two *optional* inputs in a query entry:

* `comunicaContext.sources`: an array of sources, known at the time of writing the config file;
* `sourceIndex`: describes an external RDF resource, from which sources are derived at execution time.

If both inputs are present, the query will be executed over the superset of sources.

The (auxiliary) query provided in `sourceIndex.queryLocation` is executed on `sourceIndex.url` and must result in the list of source URLs.

If `sourceIndex` is used and there is no `comunicaContext.lenient` property found, one will be created with value `true`.
This makes sure that the (main) query can succeed if not all obtained sources are accessible.

### Adding variable type

When executing a query, it gives us either a URL, a literal value or [a blank node](https://www.w3.org/TR/rdf12-concepts/#section-blank-nodes).
These URLs could reference to anything e.g. a picture, spreadsheet, resume, and so on.
Also literals can be lots of things e.g. a float, integer, string, birthdate, price, and so on.
By clarifying what the expected type is of the query result corresponding to a given variable
we can fully interpret how we can display and represent the result.

You can specify the type of a variable by extending its name with the type in the query as such: `variableName_variableType`.
The underscore `_` here is crucial to make a clear distinction between name and type.

### Templated queries

This application supports templated queries: queries whose contents are not completely fixed upfront.
They can contain *template variables*.
A template variable is an identifier preceded by a `$` sign, e.g. `$genre`.
Before submitting the SPARQL query, each template variable will be replaced by the actual value assigned to it interactively.

#### Templated queries with fixed values for the template variables

If all possible values for the template variables are fixed and hence can be written in the config file, proceed as follows.

* Replace the fixed portion(s) of the original query with (a) template variable(s).
* In the config file:
  * Add a `variables` object in the query's entry in the configuration file.
  * In the `variables` object, for each template variable, add a property with name equal to the template variable's identifier.
  * Set each such property's value to an array strings, where each string is a possible value for the corresponding template variable.

Note that template variables' values are not restricted to strings: URIs for example are also possible.
As a consequence, for strings the surround double quotes `"` must be added to the values in the list.
For URIs you must add surrounding angle brackets `<>`.
Other literals (integers for example) don't have to be surrounded with extra delimiters.
This is shown in the configuration structure above.

#### Templated queries with values for the template variables to be derived from the data

In most cases, the values for the template variables are not fixed, but depend on *the data to query*.
For those cases, these values can be specified indirectly, by referring to one or more auxiliary queries.
Proceed as follows.

* Write one or more auxiliary queries that yield the values of the template variable(s).
  The variable names in the SELECT statement must match the template variable names (e.g `?genre` for template variable `$genre`).
* Replace the fixed portion(s) of the original query with (a) template variable(s).
* In the config file:
  * Add an `indirectVariables` object in the query's entry in the configuration file.
  * In the `indirectVariables` object, add a property `queryLocations`: this must be an *array*,
    listing the location(s) of the one or more auxiliary queries that you wrote.

An example auxiliary query for the variable `$genre`, as used in one of the provided example templated queries:

```text
PREFIX schema: <http://schema.org/> 

SELECT DISTINCT ?genre WHERE {
  ?list schema:genre ?genre;
} 
```

### Query icons

In the selection menu the name of the query is proceeded by an icon.
You configure this icon per query in the configuration file.  
For this to work you need to add the icon to the exports in [IconProvider.js](./main/src/IconProvider/IconProvider.js).
We advise to use the [Material UI icons](https://material-ui.com/components/material-icons/) as this is what's used internally in `react-admin` and it is also included in the dependencies.
Nevertheless, you can use any React component you want, just make sure it's a functional component.

## Custom queries

The configuration file contains prepared, fixed queries.
In addition, a user can create and edit custom queries, either from scratch or based on an existing query.

* To create a new custom query from scratch:
  * Open "Custom Query Editor" from the menu on the left.
  * Complete the custom query editor form and click the "CREATE QUERY" button when ready.
  * Your new query is added to the "Custom queries" group and you are redirected to the query's result view.
  * If not satisfied with the query result, you can click "EDIT QUERY" to further edit your query.
    When saving changes, the result is recalculated.

* To create a new custom query based on an existing query:
  * Open the existing query.
  * Click "CLONE AS CUSTOM QUERY" (in a normal query) or "CLONE" (in a custom query).
  * Make the desired changes in the form and click the "CREATE QUERY" button when ready. The new custom query behaves as if it were created from scratch.

* To share a custom query, a "SHARE QUERY" button is provided.
  Use it to generate a unique URL for this custom query.
  Visiting that URL any time later, recreates a custom query with the same specifications.
  This may be useful to share a custom query to another user or to save it for yourself.

* To clean up an unwanted custom query, there is always a button "DELETE QUERY"...

**Warning**: custom queries are stored in your browser's memory and will disappear if the browser page is refreshed or when switching logins.

Logged in users however have the possibility to save/load their custom queries to/from a selectable location in their Solid pod, via the buttons in the Dashboard.

## Representation Mapper

If you want to add your own type representations
you can do this by adding your representation to the [representationProvider.js](./main/src/representationProvider/representationProvider.js) file.
This can be useful for example when querying images.
The result of the query is a reference to the image.
By mapping a representation we can show the actual image instead of the reference.

The mapper follows a structure:

```json
{
    "typeName": mapperComponent,
    ...
}
```

With `typeName` being the name of the variable as defined in the `query`
which is defined in [the configuration file](#configuration-file).
The function `mapperComponent` takes the query result for the corresponding variable and
returns either a [React](https://react.dev/) component (see below).
Examples of how you can do this can already be found in the [representationProvider components folder](./main/src/representationProvider/components/).

The components get the following props:

* `record` (the query result), an object of `RDF/JS` objects.
* `variable` the variable name and key of `record`, a string.

`Hint` use the [Field components](https://marmelab.com/react-admin/doc/3.19/Fields.html#basic-fields)
from `react-admin` to display the result.
They've already got styling matching that of `react-admin` and are easy to use.

`Warning` if you change the record object, the changed will still be present in the next render.

## Using the local pods

To support the provided example configuration `main/src/config.json` and the tests, this repo integrates some local pods.
You can make use of these for your own tests. Follow these steps:

* Add your data and `.acl` files in the `test/initial-pod-data` folder.
  These files will be available in the pod relative to `http://localhost:8080/example/`.
* Prepare the pods by executing `npm run reset:pods` in directory `test`.

## Testing

For testing we use [Cypress](https://www.cypress.io/).

> It is important to test the production version at least at the end of a development cycle.

The development version might be tested repeatedly during development.

### Testing the production version

1. Build the production version of the Web application and serve it:

   In directory `main`:

   ```bash
   # make really, really sure to build from scratch
   rm -rf node_modules/
   rm -rf dist/
   npm install
   # build
   npm run build
   ```

   In directory `test`:

   ```bash
   npm run serve
   ```

2. Spin up all supporting resources, as explained in [The supporting resources](#the-supporting-resources).

3. Finally, in a new terminal window, in directory `test`, you can execute the tests by running:

   For normal test execution:

   ```bash
   npm run test
   ```

   For interactive testing:

   ```bash
   npm run test:interactive
   ```

### Testing the development version

The procedure is the same as for testing the production version, except for step 1, which is now:

1. Start the Web application in development mode:

   In directory `main`:

   ```bash
   npm run dev
   ```

## Advanced Usage

You can build your applications using custom queries created interactively with the query editor. To do this, you will need access to a pod, the viewer, and the `config.json` file. Follow these steps to get started:

1. **Log in to the viewer** with an account that has access to a pod.
2. **Create custom queries** using the data viewer. You can refine and edit them until they meet your needs. Feel free to create as many queries as necessary.
3. Once you're satisfied, **save the queries** by navigating to the dashboard and saving them as a file on the pod.
4. Next, access the saved file on the pod using a Solid pod viewer, such as [Penny](https://penny.vincenttunru.com/).
5. **Copy the content** of the file, which should contain a list of query objects.
6. Open the `config.json` file and **add the query objects** to the list of existing queries.
7. If necessary, update the `queryGroupId` property to assign the queries to a different group. Ensure the group exists in the `queryGroups` list, or create the group if it doesn’t exist.
8. **Save the `config.json` file** to finalize your changes.

With these steps completed, your queries are ready to use in your application.