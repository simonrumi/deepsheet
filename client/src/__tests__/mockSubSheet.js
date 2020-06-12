module.exports = {
	metadata: {
		_id: 2,
		totalRows: 2,
		totalColumns: 3,
		parentSheetId: 1,
		summaryCell: { row: 0, column: 0 },
		columnVisibility: {},
		rowVisibility: {},
		rowFilters: {},
		columnFilters: {},
	},
	title: 'A sub sheet',
	rows: [
		{
			row: 0,
			columns: [
				{
					row: 0,
					column: 0,
					content: 'summary of sheet with id 2',
					visible: true,
				},
				{
					row: 0,
					column: 1,
					content: 'the rest',
					visible: true,
				},
				{
					row: 0,
					column: 2,
					content: 'of this sheet',
					visible: true,
				},
			],
		}, // end  row
		{
			row: 1,
			columns: [
				{
					row: 1,
					column: 0,
					content: 'is other info',
					visible: true,
				},
				{
					row: 1,
					column: 1,
					content: 'we cannot see',
					visible: true,
				},
				{
					row: 1,
					column: 2,
					content: 'from the parent',
					visible: true,
				},
			],
		}, // end  row
	], // end  rows
};
