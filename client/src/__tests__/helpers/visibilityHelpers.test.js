import { getObjectFromArrayByKeyValue } from '../../helpers';
import { 
    shouldShowColumn, 
    shouldShowRow, 
    isFilterEngaged,
    getInitialFilterValues,
    updateOrAddPayloadToState,
    isVisibilityCalculated,
} from '../../helpers/visibilityHelpers';

import { stateColumnFilters, stateRowFilters } from '../../helpers/dataStructureHelpers';

describe('visibilityHelpers', () => {
    describe('shouldShowColumn', () => {
        const columnVisibilityArr = [
            { index: 0, isVisible: true },
            { index: 1, isVisible: true },
            { index: 2, isVisible: true },
            { index: 3, isVisible: true },
            { index: 4, isVisible: true },
            { index: 5, isVisible: true },
            { index: 6, isVisible: false },
            { index: 7, isVisible: false },
            { index: 8, isVisible: false },
        ];

        it('should return true for a visible column', () => {
            const index = 2;
            expect(shouldShowColumn(columnVisibilityArr, index)).toBe(true);
        });

        it('should return false for an invisible column', () => {
            const index = 7;
            expect(shouldShowColumn(columnVisibilityArr, index)).toBe(false);
        });

        it('should return true for an empty visibility array', () => {
            const index = 7;
            expect(shouldShowColumn([], index)).toBe(true);
        });

        it('should return true for an undefined visibility array', () => {
            const index = 7;
            expect(shouldShowColumn(undefined, index)).toBe(true);
        });

        it('should return true for an index that is not in the visibility array', () => {
            const index = 99;
            expect(shouldShowColumn(columnVisibilityArr, index)).toBe(true);
        });
    });

    describe('shouldShowRow', () => {
        const rowVisibilityArr = [
            { index: 0, isVisible: true },
            { index: 1, isVisible: true },
            { index: 2, isVisible: true },
            { index: 3, isVisible: true },
            { index: 4, isVisible: true },
            { index: 5, isVisible: true },
            { index: 6, isVisible: false },
            { index: 7, isVisible: false },
            { index: 8, isVisible: false },
        ];

        it('should return true for a visible row', () => {
            const cell = { row: 2 };
            expect(shouldShowRow(rowVisibilityArr, cell)).toBe(true);
        });

        it('should return false for an invisible row', () => {
            const cell = { row: 7 };
            expect(shouldShowRow(rowVisibilityArr, cell)).toBe(false);
        });

        it('should return true for an empty visibility array', () => {
            const cell = { row: 5 };
            expect(shouldShowRow([], cell)).toBe(true);
        });

        it('should return true for an undefined visibility array', () => {
            const cell = { row: 7 };
            expect(shouldShowRow(undefined, cell)).toBe(true);
        });

        it('should return true for an index that is not in the visibility array', () => {
            const cell = { row: 99 };
            expect(shouldShowRow(rowVisibilityArr, cell)).toBe(true);
        });
    });

    describe('isFilterEngaged', () => {
            const index = 4;

            it('should return true when the filter expression contains something', () => {
                const filters = [
                    {
                        caseSensitive: false,
                        filterExpression: 'some text to filter by',
                        hideBlanks: false,
                        index: 4,
                        regex: false,
                    }
                ];
                expect(isFilterEngaged(index, filters)).toBe(true);
            });

            it('should return true when the hide blanks is true', () => {
                const filters = [
                    {
                        caseSensitive: false,
                        filterExpression: null,
                        hideBlanks: true,
                        index: 4,
                        regex: false,
                    }
                ];
                expect(isFilterEngaged(index, filters)).toBe(true);
            });

            it('should return false when hide blanks is false and there is no filter expression', () => {
                const filters = [
                    {
                        caseSensitive: false,
                        filterExpression: null,
                        hideBlanks: false,
                        index: 4,
                        regex: false,
                    }
                ];
                expect(isFilterEngaged(index, filters)).toBe(false);
            });

            it('should return false (not undefined) when hide blanks and filter expression do not exist', () => {
                const filters = [
                    {
                        caseSensitive: false,
                        index: 4,
                        regex: false,
                    }
                ];
                expect(isFilterEngaged(index, filters)).toBe(false);
            });

            it('should return false when the filters array is empty', () => {
                const filters = [];
                expect(isFilterEngaged(index, filters)).toBe(false);
            });

            it('should return false when the filters array is undefined', () => {
                expect(isFilterEngaged(index)).toBe(false);
            });
    });

    describe('getInitialFilterValues', () => {
        it('should return the column filter for the given columnIndex', () => {
            const state = {
                present: {
                    metadata: {
                        columnFilters: [
                            {index: 0, isVisible: true},
                            {index: 1, isVisible: true},
                            {index: 2, isVisible: true},
                        ]
                    }
                }
            };
            expect(stateColumnFilters(state)).toBe(state.present.metadata.columnFilters);
            expect(getInitialFilterValues({ state, rowIndex: null, columnIndex: 1 }))
                .toBe(state.present.metadata.columnFilters[1]);
            expect(getInitialFilterValues({ state, columnIndex: 1 }))
                .toBe(state.present.metadata.columnFilters[1]);
        });

        it('should return the row filter for the given rowIndex', () => {
            const state = {
                present: {
                    metadata: {
                        rowFilters: [
                            {index: 0, isVisible: true},
                            {index: 1, isVisible: true},
                            {index: 2, isVisible: true},
                        ]
                    }
                }
            };
            expect(stateRowFilters(state)).toBe(state.present.metadata.rowFilters);
            expect(getInitialFilterValues({ state, rowIndex: 2, columnIndex: null }))
                .toBe(state.present.metadata.rowFilters[2]);
            expect(getInitialFilterValues({ state, rowIndex: 2 }))
                .toBe(state.present.metadata.rowFilters[2]);
        });

        it('should return null if there is no row or column index', () => {
            const state = {
                present: {
                    metadata: {
                        rowFilters: [
                            {index: 0, isVisible: true},
                            {index: 1, isVisible: true},
                            {index: 2, isVisible: true},
                        ]
                    }
                }
            };
            expect(getInitialFilterValues({ state }))
                .toBe(null);
        });

        it('should return null if there is no state', () => {
            expect(getInitialFilterValues({ })).toBe(null);
        });
        
    });

    describe('updateOrAddPayloadToState', () => {
        const frozenRows = [
            { index: 4, isFrozen: true },
            { index: 1, isFrozen: true }
        ]
        it('should add an object with a new "index" value to an array', () => {
            const payload = [ { index: 3, isFrozen: true } ];
            const updatedState = updateOrAddPayloadToState(payload, frozenRows);
            expect(updatedState.length).toEqual(3);
            expect(getObjectFromArrayByKeyValue('index', 3, updatedState)).toEqual(payload[0]);
        });
        
        it('should update an object within the array, based on the "index" value', () => {
            const payload = [ { index: 4, isFrozen: false } ];
            const updatedState = updateOrAddPayloadToState(payload, frozenRows);
            expect(updatedState.length).toEqual(2);
            expect(getObjectFromArrayByKeyValue('index', 4, updatedState)).toEqual(payload[0]);
        });

        it('should leave the array as-is, if the payload is null', () => {
            const payload = null;
            const updatedState = updateOrAddPayloadToState(payload, frozenRows);
            expect(updatedState).toEqual(frozenRows);
        });

        it('should leave the array as-is, if the payload is undefined', () => {
            const payload = undefined;
            const updatedState = updateOrAddPayloadToState(payload, frozenRows);
            expect(updatedState).toEqual(frozenRows);
        });

        it('should return the payload, if the state is undefined', () => {
            const payload = [ { index: 4, isFrozen: false } ];
            const updatedState = updateOrAddPayloadToState(payload);
            expect(updatedState).toEqual(payload);
        });

        it('should return an empty array if the state and payload are undefined', () => {
            expect(updateOrAddPayloadToState()).toEqual([]);
        });
    });

    describe('isVisibilityCalculated', () => {
        it('should return true if the columnVisibility and rowVisibility arrays exist', () => {
            const state = {
                present: {
                    metadata: {
                        columnVisibility: [],
                        rowVisibility: []
                    }
                }
            }
            expect(isVisibilityCalculated(state)).toBeTruthy();
        });

        it('should return false if the columnVisibility exists but rowVisibility does not', () => {
            const state = {
                present: {
                    metadata: {
                        columnVisibility: [],
                    }
                }
            }
            expect(isVisibilityCalculated(state)).toBeFalsy();
        });

        it('should return false if the columnVisibility does not exist but rowVisibility does', () => {
            const state = {
                present: {
                    metadata: {
                        columnVisibility: [],
                    }
                }
            }
            expect(isVisibilityCalculated(state)).toBeFalsy();
        });

        it('should return false if the columnVisibility and rowVisibility do not exist', () => {
            const state = {
                present: {
                    metadata: {
                    }
                }
            }
            expect(isVisibilityCalculated(state)).toBeFalsy();
        });
    });
});
