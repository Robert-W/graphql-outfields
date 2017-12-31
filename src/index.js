// @flow
import { hasValue } from './utils';

import type {
	OutfieldParserReturn,
	GraphQLOutfieldTree,
	ResolveInfo,
	Node
} from './definitions';

// import type {
// 	GraphQLResolveInfo,
// 	SelectionNode,
// 	FieldNode
// } from 'graphql/index.js.flow';

// let parseAST = function (nodes: $ReadOnlyArray<SelectionNode>): GraphQLOutfieldTree {
// 	// Let's generate a JSON tree of nodes
// 	return nodes.reduce((tree: GraphQLOutfieldTree, node: SelectionNode) => {
// 		let name: string = node.name && node.name.value;
// 		let children: ?$ReadOnlyArray<SelectionNode> = node.selectionSet && node.selectionSet.selections;
// 		// Store true for the node existing if this is the final depth
// 		// otherwise, continue to traverse the AST to find all nodes
// 		tree[name] = children ? parseAST(children) : true;
//
// 		return tree;
// 	}, {});
// };

/**
 * @function parseAST
 * @description
 */
let parseAST = function (nodes: Array<Node>): GraphQLOutfieldTree {
	// Let's generate a JSON tree of nodes
	return nodes.reduce((tree: GraphQLOutfieldTree, node: Node) => {
		let name: string = node.name && node.name.value;
		let children: ?Array<Node> = node.selectionSet && node.selectionSet.selections;
		// Store true for the node existing if this is the final depth
		// otherwise, continue to traverse the AST to find all nodes
		tree[name] = children ? parseAST(children) : true;

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
let has = function (info: ResolveInfo, path: string = ''):boolean {
	return info && info.fieldNodes
		? hasValue(parseAST(info.fieldNodes), path)
		: false;
};

/**
 * @function parser
 * @description Parse the resolvers info.fieldNodes and return a JSON
 * tree representing the query outfields. Also return a convenience
 * getter to test nested path's easily.
 * @example
 * let { fields, has } = parser(resolversInfo);
 * // if has('foo.bar.baz') is true, user asked for foo.bar.baz in their results
 */

let parser = function (info: ResolveInfo): OutfieldParserReturn {
	let fields: GraphQLOutfieldTree = info && info.fieldNodes && info.fieldNodes.length
		? parseAST(info.fieldNodes)
		: {};

	return {
		fields,
		has: (path: string) => hasValue(fields, path)
	};
};

module.exports = { parser, has };
