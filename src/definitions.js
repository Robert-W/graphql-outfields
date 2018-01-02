/* eslint-disable no-use-before-define */
/* @flow */

/**
 * This is the complete return type
 */

export type OutfieldParserReturn = {
	fields: GraphQLOutfieldTree,
	has: (path: string) => boolean
};

/**
 * This is what the field results of this module will look like.
 * It is essentially a clone of the incoming query mapped to JSON
 * and adding truthy values for each field. For example, with this query
 * `{ users { from, to, users { username, email }}}`
 * you would receive the following tree:
 * {
 *    users: {
 *				from: true,
 *				to: true,
 *				users: {
 *						username: true,
 *						email: true
 *				}
 *    }
 * }
 */

export type GraphQLOutfieldTree = {
	[key: string]: boolean | GraphQLOutfieldTree
};

/**
 * The following types are properties in the GraphQLResolveInfo object
 * Many of the types inside this are union types in Flow and I was getting
 * many errors in my recursive function trying to use them. These pull out
 * only the properties I know I need in this module
 */

export type ResolveInfo = {
	fieldNodes: Array<Node>
};

export type Node = {
	name: NodeName,
	selectionSet?: NodeSelectionSet
};

export type NodeName = {
	kind: string,
	value: string
};

export type NodeSelectionSet = {
	selections?: Array<Node>
};
