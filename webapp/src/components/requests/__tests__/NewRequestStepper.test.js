import {prefixes, resolvePath} from '../NewRequestStepper.js';

describe('utilities', function () {
    describe('prefixes', function () {
        it('should be empty for empty', function () {
            const result = prefixes([])
            expect(result).toEqual([[]])
        });
        it('should be a for a', function () {
            const result = prefixes(['a'])
            expect(result).toEqual([[], ['a']])
        });
        it('should be a, ab for a,b', function () {
            const result = prefixes(['a', 'b'])
            expect(result).toEqual([[], ['a'], ['a', 'b']])
        });
        it('should be a, ab, abc for a,b,c', function () {
            const result = prefixes(['a', 'b', 'c'])
            expect(result).toEqual([[], ['a'], ['a', 'b'], ['a', 'b', 'c']])
        });
    });

    describe('resolvePath', function () {
        describe('basic hierarchy', function () {

            const pathList = [
                {id: 0, normalizedAbsolutePath: '/'},
                {id: 1, normalizedAbsolutePath: '/a'},
                {id: 2, normalizedAbsolutePath: '/a/b'},
                {id: 3, normalizedAbsolutePath: '/a/b/c'},
                {id: 4, normalizedAbsolutePath: '/a/{}'},
                {id: 5, normalizedAbsolutePath: '/a/{}/d'},
            ]
            it('should be root if empty', function () {
                const result = resolvePath([], pathList)
                expect(result.lastMatch.id).toBe(0)
                expect(result.toAdd.length).toBe(0)
            });
            it('should yield an item in toAdd for each unresolved path', function () {
                const result = resolvePath(['a', 'b', 'e'].map(name => ({name, isParameter: false})), pathList)
                expect(result.lastMatch.id).toBe(2)
                expect(result.toAdd.length).toBe(1)
                expect(result.toAdd[0].name).toBe('e')
            });
        })
    })
});