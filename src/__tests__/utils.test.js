// @flow

import { hasValue } from '../utils';

import type { GraphQLOutfieldTree } from '../definitions';

const mock:GraphQLOutfieldTree = {
	scooby: {
		dooby: {
			doo: true
		}
	}
};

describe('Utils Tests', () => {

	describe('Function: hasValue', () => {

		test('should return true if the path is a valid prop', () => {
			expect(hasValue(mock, 'scooby')).toBeTruthy();
		});

		test('should return true if the path is a valid nested prop', () => {
			expect(hasValue(mock, 'scooby.dooby.doo')).toBeTruthy();
		});

		test('should return false if the prop is not a valid path', () => {
			expect(hasValue(mock, 'and')).toBeFalsy();
		});

		test('should return false if the prop is not a valid nested path', () => {
			expect(hasValue(mock, 'and.shaggy.too')).toBeFalsy();
		});

		test('should return false if the object is not provided', () => {
			expect(hasValue(undefined, 'scooby.dooby.doo')).toEqual(false);
		});

		test('should return false if the path is not provided', () => {
			expect(hasValue(mock)).toEqual(false);
		});

	});

});
