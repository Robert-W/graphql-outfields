const { graphql, buildSchema } = require('graphql');
const { parser, has } = require('../src');

let SimpleSchema = `
	type SimpleSchema {
		foo: String
		bar: String
		baz: String
	}
`;

let UsersSchema = `
	type User {
		full_name: String
		username: String
		email: String
	}

	type UsersSchema {
		users: [User]
		count: Int
		from: Int
		to: Int
	}
`;

let schema = buildSchema(`
	${SimpleSchema}
	${UsersSchema}
	type Query {
		simple: SimpleSchema
		users: UsersSchema
	}
`);

let resolvers = {};

/**
 * @NOTE
 * Triggering errors or tests inside the resolver functions does not
 * actually throw errors, run the checks in the then callback
 */

describe('GraphQL Outfields Parser Tests', () => {

	beforeAll(() => {
		// Setup default resolvers
		resolvers.simple = () => ({});
		resolvers.users = () => ({});
	});

	describe('Function: has', () => {

		test('should check if certain outfields are present', () => {
			let _context;
			let query = '{ simple { foo, bar }}';

			resolvers.simple = (root, args, context) => {
				_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				expect(has(_context, 'simple.foo')).toBeTruthy();
				expect(has(_context, 'simple.bar')).toBeTruthy();
				expect(has(_context, 'simple.baz')).toBeFalsy();
				expect(res.errors).toBeUndefined();
			});
		});

		test('should check if nested outfields are present', () => {
			let _context;
			let query = '{ users { users { username, email, full_name }}}';

			resolvers.users = (root, args, context) => {
				_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				expect(has(_context, 'users.users.full_name')).toBeTruthy();
				expect(has(_context, 'users.users.username')).toBeTruthy();
				expect(has(_context, 'users.users.email')).toBeTruthy();
				expect(res.errors).toBeUndefined();
			});
		});

		test('should be able to check for fields for multiple schemas in one query', () => {
			let _simple_context, _user_context;
			// Query for users and our simple query at once
			let query = `{
				simple { foo, baz }
				users {
					users { username, email }
					from
					to
				}
			}`;

			// Setup resolvers for both types
			resolvers.simple = (root, args, context) => {
				_simple_context = context;
				return {};
			};

			resolvers.users = (_, args, context) => {
				_user_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				expect(has(_simple_context, 'simple.foo')).toBeTruthy();
				expect(has(_simple_context, 'simple.bar')).toBeFalsy();
				expect(has(_simple_context, 'simple.baz')).toBeTruthy();

				expect(has(_user_context, 'users.count')).toBeFalsy();
				expect(has(_user_context, 'users.from')).toBeTruthy();
				expect(has(_user_context, 'users.to')).toBeTruthy();
				expect(has(_user_context, 'users.users.username')).toBeTruthy();
				expect(has(_user_context, 'users.users.email')).toBeTruthy();

				expect(res.errors).toBeUndefined();
			});
		});

		test('should not throw an error if given invalid parameters', () => {
			let query = '{ simple { foo, bar }}';

			return graphql(schema, query, resolvers).then(res => {
				expect(() => {
					has(undefined, 'foo.bar');
					has({}, undefined);
				}).not.toThrow();

				expect(res.errors).toBeUndefined();
			});
		});

	});

	describe('Function: parser', () => {

		test('should parse outfields from a simple query', () => {
			let _context;
			let query = '{ simple { foo, bar }}';

			// Setup a custom resolver and execute our tests here
			resolvers.simple = (root, args, context) => {
				_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				let { fields } = parser(_context);
				// Parser will always return the fields inside an object
				// with a property matching the schemas name
				let { simple } = fields;
				// Simple should include all the fields asked for from above
				// but not any of the fields we did not ask for
				expect(simple.foo).toBeTruthy();
				expect(simple.bar).toBeTruthy();
				expect(simple.baz).toBeFalsy();
				expect(res.errors).toBeUndefined();
			});
		});

		test('should return a convenience `has` function to check if fields exist', () => {
			let _context;
			let query = '{ simple { foo, bar }}';

			// Setup a custom resolver and execute our tests here
			resolvers.simple = (root, args, context) => {
				_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				let { has: local_has } = parser(_context);
				// the has function should provide a convenience accessor so you
				// do not need to do safety checks, e.g foo && foo.bar && foo.bar.baz
				expect(local_has('simple.foo')).toBeTruthy();
				expect(local_has('simple.bar')).toBeTruthy();
				expect(local_has('simple.baz')).toBeFalsy();
				expect(res.errors).toBeUndefined();
			});
		});

		test('should be able to parse outfield from multiple query types at once', () => {
			let _simple_context, _user_context;
			// Query for users and our simple query at once
			let query = `{
				simple { foo, baz }
				users {
					users { username, email }
					from
					to
				}
			}`;


			// Setup resolvers for both types
			resolvers.simple = (root, args, context) => {
				_simple_context = context;
				return {};
			};

			resolvers.users = (_, args, context) => {
				_user_context = context;
				return {};
			};

			return graphql(schema, query, resolvers).then(res => {
				// Test the simple resolver outfields
				let { fields: simple_fields = {}} = parser(_simple_context);
				let { simple } = simple_fields;

				expect(simple.foo).toBeTruthy();
				expect(simple.bar).toBeFalsy();
				expect(simple.baz).toBeTruthy();

				let { has: users_have = {}} = parser(_user_context);

				expect(users_have('users.from')).toBeTruthy();
				expect(users_have('users.to')).toBeTruthy();
				expect(users_have('users.count')).toBeFalsy();
				expect(users_have('users.users.username')).toBeTruthy();
				expect(users_have('users.users.email')).toBeTruthy();

				expect(res.errors).toBeUndefined();
			});
		});

		test('should not throw an error if given invalid parameters', () => {
			let query = '{ simple { foo, bar }}';

			return graphql(schema, query, resolvers).then(res => {
				expect(() => {
					parser(undefined);
					parser({});
				}).not.toThrow();

				expect(res.errors).toBeUndefined();
			});
		});

		test('should not throw if context is somehow malformed', () => {
			let query = '{ simple { foo, bar }}';
			let context = { fieldNodes: [undefined, {}] };

			return graphql(schema, query, resolvers).then(res => {
				expect(() => parser(context)).not.toThrow();

				expect(res.errors).toBeUndefined();
			});
		});

		test('should return an empty object if context is somehow malformed', () => {
			let query = '{ simple { foo, bar }}';
			let context = { fieldNodes: [undefined, {}] };

			return graphql(schema, query, resolvers).then(res => {
				expect(() => {
					let { fields, has: local_has } = parser(context);
					expect(local_has('simple.foo')).toBeFalsy();
					expect(Object.keys(fields).length).toBe(0);
				}).not.toThrow();

				expect(res.errors).toBeUndefined();
			});
		});

	});

});
