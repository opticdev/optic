import {starterCommands} from '../../../contexts/RfcContext.js';
import {Facade, Queries} from '../../../engine';
import {ShapeUtilities} from '../ShapeUtilities.js';

describe('flattened shapes', function () {
    describe('pagination example', function () {
        const rfcId = 'test-rfc'
        const eventStore = Facade.makeEventStore();
        const rfcService = Facade.fromJsonCommands(eventStore, '[]', rfcId)
        const queries = Queries(eventStore, rfcService, rfcId);
        rfcService.handleCommands(rfcId, ...starterCommands)

        it('should render $UserListResponse1', function () {
            const shapeId = '$UserListResponse1'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
        it('should render $PaginationWrapper', function () {
            const shapeId = '$PaginationWrapper'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
        it('should render $Account', function () {
            const shapeId = '$Account'
            const output = []
            ShapeUtilities.flatten(queries, shapeId, 0, [], output)
            expect(output).toMatchSnapshot()
        });
    });
});