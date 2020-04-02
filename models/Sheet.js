const FilterSchema = require('./Filter');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const sheetSchema = new Schema(
	{
		metadata: {
			totalRows: { type: Number, required: true, default: 10 },
			totalColumns: { type: Number, required: true, default: 5 },
			parentSheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
			columnVisibility: { type: Map, of: Boolean },
			rowVisibility: { type: Map, of: Boolean },
			columnFilters: { type: Map, of: FilterSchema },
			rowFilters: { type: Map, of: FilterSchema },
		},
		title: { type: String, requried: true, default: 'A Deep Deep Sheet' },
		rows: [
			{
				row: { type: Number, required: true },
				columns: [
					{
						row: { type: Number, required: true },
						column: { type: Number, required: true },
						content: { type: Schema.Types.Mixed, required: true },
						visible: { type: Boolean, required: true, default: true },
					},
				],
			},
		],
	},
	{ collection: 'sheets' }
);

mongoose.model('sheets', sheetSchema);
