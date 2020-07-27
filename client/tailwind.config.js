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
            'light-light-orange-transparent': 'rgba(255, 230, 199, 0.5)',
         },
         inset: {
            '4': '4px',
            '1/4': '25%',
            '1/3': '33%',
            '1/2': '50%',
            '2/3': '67%',
            '3/4': '75%',
         },
         gridTemplateRows: {
            '2-thin-bottom': '1fr 0.25em',
         },
         maxWidth: {
            '1/4': '25%',
            '1/2': '50%',
            '3/4': '75%',
         },
      },
      flex: {
         '2': '2 2 0%',
      },
      cursor: {
         auto: 'auto',
         default: 'default',
         pointer: 'pointer',
         wait: 'wait',
         text: 'text',
         move: 'move',
         'not-allowed': 'not-allowed',
         'row-resize': 'row-resize',
         'col-resize': 'col-resize',
      },
   },
   variants: {},
   plugins: [
      function ({ addVariant, e }) {
         addVariant('checked', ({ modifySelectors, separator }) => {
            modifySelectors(({ className }) => {
               return `.${e(`checked${separator}${className}`)}:checked`;
            });
         });
      },
   ],
};
