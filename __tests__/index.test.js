const { parser, has } = require('../src');

describe('GraphQL Outfields Parser Tests', () => {

	describe('Function: has', () => {

		test('placeholder', () => {
			expect(has).not.toBeUndefined();
		});

	});

	describe('Function: parser', () => {

		test('placeholder', () => {
			expect(parser).not.toBeUndefined();
		});

	});

});
