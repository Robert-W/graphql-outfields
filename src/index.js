const { hasValue } = require('./utils');

/**
 * @function parseAST
 * @description
 */
let parseAST = function (nodes = []) {
	// Let's generate a JSON tree of nodes
	return nodes.reduce((tree, node = {}) => {
		let name = node.name && node.name.value;
		let children = node.selectionSet && node.selectionSet.selections;
		// Store true for the node existing if this is the final depth
		// otherwise, continue to traverse the AST to find all nodes
		if (name) {
			tree[name] = children ? parseAST(children) : true;
		}

		return tree;
	}, {});
};

/**
 * @function has
 * @description Check if a particular field is in the outfields for a query
 * @example
 * // returns true if foo.bar.baz is in query, or false if it does not
 * has(resolverInfo, 'foo.bar.baz')
 */
let has = function (context = {}, path = '') {
	return hasValue(parseAST(context.fieldNodes), path);
};

/**
 * @function parser
 * @description Parse the resolvers context.fieldNodes and return a JSON
 * tree representing the query outfields. Also return a convenience
 * getter to test nested path's easily.
 * @example
 * let { fields, has } = parser(resolversContext);
 * // if has('foo.bar.baz') is true, user asked for foo.bar.baz in their results
 */
let parser = function (context = {}) {
	let fields = parseAST(context.fieldNodes);

	return {
		fields,
		has: (path) => hasValue(fields, path)
	};
};

module.exports = { parser, has };
