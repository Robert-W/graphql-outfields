graphql-outfields [![Build Status](https://travis-ci.org/Robert-W/graphql-outfields.svg?branch=master)](https://travis-ci.org/Robert-W/graphql-outfields)
=================
> Parse the return fields from a GraphQL query by means of the resolver info.

## Intro
`graphql-outfields` was designed to make it easier to figure out what fields the client asked for when issuing a graphql query. The typical use case for this is for optimizing back end queries, but can also be useful for other applications. For example, you could use the results of `graphql-outfields` parser to limit the return fields of any database query, like setting `_source` in an Elasticsearch query.

## Installation
```shell
yarn add graphql-outfields
# -- or -- #
npm install graphql-outfields
```

## Usage
```javascript
const outfields = require('graphql-outfields');

// Let's say the client issues a GraphQL query like this
query {
	user(id:5){
		username
		profile_pic { small }
	}
	location(city: 'South Park') {
		state
		zipcode
	}
}

// In your resolver
let resolver = (root, args, ctx, info) => {
	let { fields, has } = outfields.parser(info);
	/**
	* fields now looks like this:
	*{
	*	user: {
	*		username: true,
	*		profile_pic: {
	*			small: true
	*		}
	*	},
	*	location: {
	*		state: true,
	*		zipcode: true
	*	}
	*}
	*/
	assert.ok(fields.user.username);
	// However the parser may still require you to check properties along the way,
	// so nested objects can get ugly, instead of this
	if (fields.user && fields.user.profile_pic && fields.user.profile_pic.small) {
		// ...do stuff
	}
	// You can do this
	if (has('user.profile_pic.small')) {
		// ...do stuff
	}
	
	// If you just want to check a single field and nothing else
	// `graphql-outfields` has a top level has method 
	if (outfields.has(info, 'location.state')) {
		// They asked for the state in the location query
	}
	
	if (outfields.has(info, 'user.profile_pic.small')) {
		// They asked for the small profile picture
	}
};

```

## Having trouble with something?
If you have questions specific to Node or GraphQL, please consider posting your question on Stack Overflow, they have a lot of support already available for those topics. If you have questions on how any of those are used in this repo or how to use this package, don't hesitate to ask in the issues section. If you think you are experiencing a bug, please create an issue in [graphql-outfields/issues](https://github.com/Robert-W/graphql-outfields/issues).

## Want to Contribute?
Please see the [CONTRIBUTING.md](./.github/CONTRIBUTING.md) if interested in contributing.

## License
graphql-outfields is [MIT licensed](./LICENSE)
