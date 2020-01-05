module.exports = {
	theme: {
		extend: {
			colors: {
				'dark-dark-blue': '#04191c',
				'grey-blue': '#a5cacf',
				'light-light-blue': '#c7f8ff',
				'vibrant-blue': '#3ed2e5',
				'subdued-blue': '#32a8b8',
				'burnt-orange': '#B87B32',
				'vibrant-burnt-orange': '#E69A3E',
			},
			inset: {
				'1/4': '25%',
				'1/3': '33%',
				'1/2': '50%',
				'2/3': '67%',
				'3/4': '75%',
			},
		},
		flex: {
			'2': '2 2 0%',
		},
	},
	variants: {},
	plugins: [
		function({ addVariant, e }) {
			addVariant('checked', ({ modifySelectors, separator }) => {
				modifySelectors(({ className }) => {
					return `.${e(`checked${separator}${className}`)}:checked`;
				});
			});
		},
	],
};
