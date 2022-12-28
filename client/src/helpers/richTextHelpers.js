import htmlReactParser from 'html-react-parser';
import * as R from 'ramda';
import managedStore from '../store';
import { isSomething, isNothing, arrayContainsSomething, reduceWithIndex } from '../helpers';
import { encodeText, decodeText } from './cellHelpers';
import { 
	sortStyleRanges,
	stylesOverlap,
	splitStyleRanges,
	addStylesToStyleRanges,
	applyStyling,
	isCharInRange,
	getBlocksForSelection,
} from './richTextStyleRangeHelpers';
import {
   cellText,
   cellFormattedText,
   cellFormattedTextBlocks,
   stateIsHandlingPaste,
   stateFocusTextSelection,
} from './dataStructureHelpers';
import { NEWLINE_REGEX, BLOCK_END_CHAR_LENGTH, LOG } from '../constants';
import { log } from '../clientLogger';

export const getSelectionRange = cellInPlaceEditorRef => stateIsHandlingPaste(managedStore.state) 
	? R.pipe(
		stateFocusTextSelection,
		textSelection => ({ 
			cursorStart: R.prop('start', textSelection),
			cursorEnd: R.prop('end', textSelection)
		})
	)(managedStore.state)
	: {
	cursorStart: R.path(['current','selectionStart'], cellInPlaceEditorRef),
	cursorEnd: R.path(['current','selectionEnd'], cellInPlaceEditorRef)
};

export const makeEmptyFormattedText = () => ({ blocks: [] });

export const makeBlockForText = ({ text = '', key, inlineStyleRanges = [] }) => {
	if (isNothing(key)) {
		const { key: newKey } = getRandomKey({ usedKeys: [] });
		return { key: newKey, inlineStyleRanges, text };
	}
	return { key, inlineStyleRanges, text }
};

// used by cellHelpers when sending data to db
export const encodeFormattedText = formattedText => isSomething(formattedText) 
	? R.pipe(
		R.prop('blocks'),
		// encode the text within each block
		R.map(block => R.pipe(
			R.prop('text'),
			encodeText,
			R.assoc('text', R.__, block)
		)(block)),
		R.assoc('blocks', R.__, formattedText) // put the blocks back into formattedText
	)(formattedText)
	: formattedText; // this might be an empty string or undefined or null...either way we'll return whatever we got

export const decodeFormattedText = formattedText => R.pipe(
	R.prop('blocks'),
	// decode the text within each block
	R.map(block => R.pipe(
		R.prop('text'),
		decodeText,
		R.assoc('text', R.__, block)
	)(block)),
	R.assoc('blocks', R.__, formattedText), // put the blocks back into formattedText
)(formattedText);

/***
 * helpers for JSX
 */

const addBlockSeparators = blocksAsHtml => R.reduce(
	(accumulator, blockHtml) => {
		if (blocksAsHtml.length - 1 === accumulator.htmlArr.length) {
			// we're in the last block, so we don't need a block separator and we just return the html array
			return R.append(blockHtml, accumulator.htmlArr);
		}
		// adding keys to the br tags because if we get brs by themselves then they need a key or React throws warnings. Safest to add keys to every one
		const { key, usedKeys: updatedUsedKeys } = getRandomKey({ usedKeys: accumulator.usedKeys });
		const newBlockHtml = blockHtml + '<br key="' + key + '">'; 
		return {
			htmlArr: R.append(newBlockHtml, accumulator.htmlArr), 
			usedKeys: updatedUsedKeys
		}
	}, 
	{ htmlArr: [], usedKeys: [] }, // initial values
	blocksAsHtml
);

const convertOneBlockToJsx = block => {
	// note that inlineStyleRanges look like this
	// [{offset: 6, length: 4, style: 'BOLD'}, ...]
	// but we need to convert them to this sort of thing to work with:
	// [{offset: 6, length: 4, styles: ['BOLD', 'UNDERLINE'] }, ...]
	const plainText = block.text;
	const sortedStyleRanges = sortStyleRanges(block.inlineStyleRanges);
	const updatedStyleRanges = stylesOverlap(sortedStyleRanges) 
		? splitStyleRanges({ styleRanges: sortedStyleRanges, plainText })
		: addStylesToStyleRanges(sortedStyleRanges);
	const { lastOffset, formattedText } = applyStyling({ plainText, styleRanges: updatedStyleRanges });
	return formattedText + R.slice(lastOffset, Infinity, plainText);
}

export const convertBlocksToJsx = blocks => R.pipe(
	R.map(convertOneBlockToJsx),
	addBlockSeparators,
	R.map(htmlReactParser)
)(blocks);

export const getFormattedText = cell => {
	if (isNothing(cellFormattedText(cell))) {
		return {
			blocks: [{
				inlineStyleRanges: [],
				text: isSomething(cellText(cell)) ? cellText(cell) : '', // eventually we won't have any data in cellText
			}]
		}
	}
	return cellFormattedText(cell); // eventually everything should have cellFormattedText
}

export const getCellPlainText = (cell, includeNewLineChars = true) => R.pipe(
	cellFormattedTextBlocks,
	R.reduce(
		(accumulator, block) => R.pipe(
			R.prop('text'), 
			R.concat(accumulator), 
			text => includeNewLineChars ? R.concat(text, '\n') : R.concat(text, ' ')
		)(block),
		'', //initial text
	),
	R.slice(0,-1), // remove the last \n or space
)(cell);

export const cleanFormattedText = formattedText => R.pipe(
	R.prop('blocks'),
	R.map(block => R.pick(['inlineStyleRanges', 'key', 'text'], block)),
	R.assoc('blocks', R.__, {})
)(formattedText);

/***
 * helpers for blocks
 */

export const getRandomKey = ({ remainingKeys = [], usedKeys = [] }) => {
	const MULTIPLIER = Math.pow(2, 24);
	if (remainingKeys.length > 0) {
		return {
			key: R.head(remainingKeys),
			remainingKeys: R.tail(remainingKeys), 
			usedKeys: R.pipe(R.head, R.append(R.__, usedKeys))(remainingKeys)
		}
	}
	// no remainingKeys to use, so we need to create a key, checking that it's not already in the usedKeys
	const generateKey = () => Math.floor(Math.random() * MULTIPLIER).toString(32);

	const key = R.until(
		key => R.not(R.find(R.equals(key), usedKeys)), // this is the predicate - a function that returns true if the generated key is not already being used
		generateKey, // this function is called until the predicate above returns true
		generateKey() // initial value for "key" to try in the predicate function
	)

	return {
		key,
		remainingKeys,
		usedKeys: R.append(key, usedKeys)
	};
}

const splitBlock = ({ block, keys }) => {
	const textArr = R.pipe(R.prop('text'), R.split(NEWLINE_REGEX))(block);

	const basicBlock = {
		inlineStyleRanges: [], 
		key: null,
		text: '',
	}

	const { blocks } = R.reduce(
		(accumulator, text) => {
			const { key, remainingKeys, usedKeys } = getRandomKey({ remainingKeys: accumulator.remainingKeys });
			const { blockOffset } = accumulator;
			const endBlock = blockOffset + text.length;

			// figure out style ranges for the current block
			const applicableStyleRanges = R.reduce(
				(accumulator, styleRange) => {
					const endStyleRange = styleRange.offset + styleRange.length;
					
					// case 1 - block starts before the style range and ends in the middle or at the end of the style range
					if (blockOffset < styleRange.offset && endBlock > styleRange.offset && endBlock <= endStyleRange) {
						return R.append({
							...styleRange,
							offset: styleRange.offset - blockOffset,
							length: text.length - (styleRange.offset - blockOffset), 
						}, accumulator)
					}
					
					// case 2 - block starts in the middle, or start of the style range, and ends after it
					if (styleRange.offset <= blockOffset && blockOffset < endStyleRange && endStyleRange < endBlock) {
						return R.append({
							...styleRange,
							offset: 0,
							length: styleRange.length - (blockOffset - styleRange.offset),
						}, accumulator);
					}

					// case 3 - block starts at the same point as the style range, or in the middle of it, and ends in the middle or at the exact end of the style range
					if (styleRange.offset <= blockOffset && endBlock <= endStyleRange) {
						return R.append({
							...styleRange,
							offset: 0,
							length: text.length,
						}, accumulator);
					}

					// case 4 - block starts before and ends after the style range
					if (blockOffset < styleRange.offset && endStyleRange < endBlock) {
						return R.append({
							...styleRange,
							offset: styleRange.offset - blockOffset,
						}, accumulator);
					}

					// case 5 - block comes before or after style range
					if (endBlock <= styleRange.offset || blockOffset >= endStyleRange) {
						return accumulator
					}

					// shouldn't get here, but doing this to avoid console warnings
					return accumulator;
				},
				[], // initial value of updated style ranges
				block.inlineStyleRanges
			);

			const newBlock = R.pipe(
				R.assoc('key', key),
				R.assoc('text', text),
				R.assoc('inlineStyleRanges', applicableStyleRanges),
			)(basicBlock);
			return {
            remainingKeys,
            usedKeys,
            blocks: R.append(newBlock, accumulator.blocks),
            blockOffset: endBlock,
         };
		},
		{ remainingKeys: keys, usedKeys: [], blocks: [], blockOffset: 0 },
		textArr
	);
	return blocks;
};

const getCursorEndPosition = ({ blocks, combinedBlock, cursorPosInEndBlock }) => {
	// the distance from the end of the last block in the blocks array will be the same as the distance from the end of the combined block
	const distanceFromEnd = R.pipe(
		R.last,
		R.prop('text'),
		R.length,
		R.subtract(R.__, cursorPosInEndBlock), 
	)(blocks);
	return R.pipe(
		R.prop('text'),
		R.length,
		R.subtract(R.__, distanceFromEnd),
	)(combinedBlock);
}

const concatenateBlocks = ({ blocksInSelection }) => {
	return R.reduce(
		(accumulator, block) => {
			const updatedText = R.pipe(
				R.prop('text'),
				R.concat(R.prop('text', accumulator))
			)(block);

			const updatedStyles = R.map(
				styleRange => R.assoc('offset', styleRange.offset + accumulator.text.length, styleRange)
			)(block.inlineStyleRanges);

			const newKeys = R.pipe(
				R.prop('key'),
				R.append(R.__, accumulator.keys)
			)(block)

			return R.pipe(
				R.prop('inlineStyleRanges'),
				R.concat(R.__, updatedStyles),
				R.assoc('inlineStyleRanges', R.__, accumulator),
				R.assoc('text', updatedText),
				R.assoc('keys', newKeys),
				R.assoc('key', R.head(newKeys)), //use the first key as the key for the concatentated block
			)(accumulator)
		},
		// initial values:
		{
			keys: [], // this will collect the keys from each block for re-use later 
			text: '', // this will hold the string of all the blocks' text concatenated together
			inlineStyleRanges: [] // this will collect the styleRanges from all the blocks
		}, 
		blocksInSelection
	);
}

const appendBlockToArr = R.curry((block, arrName, obj) =>
   R.pipe(
		R.prop(arrName), 
		R.append(block), 
		R.assoc(arrName, R.__, obj)
	)(obj)
);

const categorizeBlocks = ({ formattedText, cursorStart, cursorEnd }) => {
   const { start, end } = getBlocksForSelection({ cursorStart, cursorEnd, blocks: R.prop('blocks', formattedText) }); // we can also get middle but not using it here
   const firstKey = R.prop('blockKey', start);
   const lastKey = R.prop('blockKey', end);

   // blocks are in order, so divide them up depending on where the blocks with the firstKey and with the lastKey are found
   return R.reduce(
      (accumulator, block) => {
         switch (accumulator.currentAssumedPosition) {
            case 'before_selection':
               return firstKey === block.key // if this is the case we've moved from before_selection to in_selection
                  ? R.pipe(
                       appendBlockToArr(block, 'blocksInSelection'),
                       R.assoc('currentAssumedPosition', 'in_selection')
                    )(accumulator)
                  : appendBlockToArr(block, 'blocksBeforeSelection', accumulator);

            case 'in_selection':
               return firstKey === lastKey // if this is the case we've already moved to after_selection
                  ? R.pipe(
                       appendBlockToArr(block, 'blocksAfterSelection'),
                       R.assoc('currentAssumedPosition', 'after_selection')
                    )(accumulator)
                  : lastKey === block.key // if this is the case we're in the last block of the selection
                  ? R.pipe(
                       appendBlockToArr(block, 'blocksInSelection'),
                       R.assoc('currentAssumedPosition', 'after_selection')
                    )(accumulator)
                  : appendBlockToArr(block, 'blocksInSelection', accumulator); // we're still in the middle of the selection

            case 'after_selection':
               return appendBlockToArr(block, 'blocksAfterSelection', accumulator);

            default:
               return accumulator; // should never have this case because currentAssumedPosition must be one of the 3 strings within this R.reduce function
         }
      },
      {
         blocksBeforeSelection: [],
         blocksInSelection: [],
         blocksAfterSelection: [],
         currentAssumedPosition: 'before_selection',
         startBlockInfo: start,
         endBlockInfo: end,
      }, // initial values
      R.prop('blocks', formattedText)
   );
};;

/***
 * helpers for pasting
 */

const createNewStyleRangesForPaste = ({ startSelection, endSelection, styleRange, textToPaste }) => {
	const endStyleRange = styleRange.offset + styleRange.length;
	const textLength = R.pipe(R.replace, R.length)(NEWLINE_REGEX, '', textToPaste); // want to ignore any newlines for calculation of style range offsets, as we will split into multiple blocks if there are newlines

	// case 1 - selection starts before the style range and ends in the middle or at the end of the style range
	if (startSelection < styleRange.offset && endSelection > styleRange.offset && endSelection <= endStyleRange) {
		return R.pipe(
			R.subtract,
			length => length > 0
				? R.pipe(
					R.assoc('length', R.__, styleRange),
					R.assoc('offset', startSelection + textLength),
					R.append(R.__, [])
				)(length)
				: []
		)(endStyleRange, endSelection);
	}

	// case 2 - selection starts in the middle, or start of the style range, and ends after it
	if (styleRange.offset <= startSelection && startSelection < endStyleRange && endStyleRange < endSelection) {
		return R.pipe(
			R.subtract,
			length => length > 0 
				? R.pipe(
					R.assoc('length', R.__, styleRange),
					R.append(R.__, [])
				)(length) 
				: []
		)(startSelection, styleRange.offset);
	}

	// case 3a - selection starts & ends in the middle of the style range
	if (styleRange.offset < startSelection && endSelection < endStyleRange) {
		return R.pipe(
			// new style range before the selection
			R.subtract,
			R.assoc('length', R.__, styleRange),
			R.append(R.__, []),
			// new style range after the selection
			styleRanges => R.pipe(
				R.subtract,
				R.assoc('length', R.__, styleRange),
				R.assoc('offset', startSelection + textLength),
				R.append(R.__, styleRanges)
			)(endStyleRange, endSelection)
		)(startSelection, styleRange.offset);
	}

	// case 3b - selection & style range start at the same point, and the selection ends in the middle of the style range
	if (styleRange.offset === startSelection && endSelection < endStyleRange) {
		return R.pipe(
			R.subtract,
			R.assoc('length', R.__, styleRange),
			R.assoc('offset', startSelection + textLength),
			R.append(R.__, [])
		)(endStyleRange, endSelection);
	}

	// case 3c - selection starts in the middle of the style range, and the selection & style range end at the same point
	if (styleRange.offset < startSelection && endSelection === endStyleRange) {
		return R.pipe(
			R.subtract,
			R.assoc('length', R.__, styleRange),
			R.append(R.__, [])
		)(startSelection, styleRange.offset);
	}

	// case 3d - selection and style range start and end at the same points
	if (styleRange.offset === startSelection && endSelection === endStyleRange) {
		return [];
	}

	// case 4 - selection starts before and ends after the style range
	if (startSelection < styleRange.offset && endStyleRange < endSelection) {
		return [];
	}

	// case 5a - selection comes before style range
	if (endSelection <= styleRange.offset) {
		return R.pipe(
			R.subtract, // gets the selection length
			R.subtract(textLength), // gets the difference between the length of the selection and the length of the new text 
			R.add(styleRange.offset), // move the start of the style range accordingly
			R.assoc('offset', R.__, styleRange),
			R.append(R.__, [])
		)(endSelection, startSelection);
	}
	
	// case 5b - selection comes after style range
	if (startSelection >= endStyleRange) {
		return [styleRange];
	}
}

const pasteTextWithinOneBlock = ({ block, start, end, textToPaste }) => {
	const blockText = R.prop('text', block) || '';
	const beforeSelection = R.slice(0, start, blockText);
	const afterSelection = R.slice(end, Infinity, blockText);
	const newText = beforeSelection + textToPaste + afterSelection;
	const selectionStyleRanges = R.prop('inlineStyleRanges', block);
	return selectionStyleRanges.length > 0
		? R.pipe(
			R.map(styleRange =>
				createNewStyleRangesForPaste({
					startSelection: start,
					endSelection: end,
					styleRange,
					textToPaste,
				})
			),
			R.unnest,
			R.assoc('inlineStyleRanges', R.__, block),
			R.assoc('text', newText),
		)(selectionStyleRanges)
		: R.assoc('text', newText, block); // no styles in the selection, so just return the block with the text replaced
}

export const addPastedTextToCell = ({ text, cell, cursorStart, cursorEnd }) => {
	const formattedText = cellFormattedText(cell);
	const {
      blocksBeforeSelection,
      blocksInSelection,
      blocksAfterSelection,
      startBlockInfo: { cursorPosition: cursorStartInStartBlock },
      endBlockInfo: { cursorPosition: cursorEndInEndBlock },
   } = categorizeBlocks({ formattedText, cursorStart, cursorEnd });
	const selectionBlock = concatenateBlocks({ blocksInSelection });
	const cursorEndInSelectionBlock = getCursorEndPosition({
      blocks: blocksInSelection,
      combinedBlock: selectionBlock,
      cursorPosInEndBlock: cursorEndInEndBlock,
   });
	const { keys } = selectionBlock;

	return R.pipe(
		pasteTextWithinOneBlock,
		block => splitBlock({ block, keys }),
		newBlocks => R.unnest([ blocksBeforeSelection, newBlocks, blocksAfterSelection ]),
		R.assoc('blocks', R.__, formattedText),
	)({
		block: selectionBlock, // we pass on a couple of extra parameters that are not part of formattedText, but shouldn't matter
		start: cursorStartInStartBlock,
		end: cursorEndInSelectionBlock,
		textToPaste: text,
	}); // the 1st function in the pipe will put the selectionBlock into the rawState
}

/***
 * helpers for managing change
 */
export const replaceBlockInFormattedText = ({ newBlock, formattedText }) => R.pipe(
	R.prop('blocks'),
	R.map(block => R.prop('key', block) === R.prop('key', newBlock) ? newBlock : block),
	R.assoc('blocks', R.__, formattedText)
)(formattedText);

const accomodateCharInStyleRanges = ({ charPosition, styleRanges, charsAdded }) => R.pipe(
	sortStyleRanges,
	R.reduce(
		(accumulator, styleRange) => {
			if (accumulator.beforeCharStyleRanges) {
				if (isCharInRange({ charPosition, styleRange })) {
					return {
						newStyleRanges: R.append({ ...styleRange, length: styleRange.length + charsAdded }, accumulator.newStyleRanges),
						beforeCharStyleRanges: false,
						beforeTailingStyleRanges: true
					};
				}
				return {
					newStyleRanges: R.append(styleRange, accumulator.newStyleRanges),
					beforeCharStyleRanges: true,
					beforeTailingStyleRanges: true
				};
			}
			if (accumulator.beforeTailingStyleRanges && isCharInRange({ charPosition, styleRange })) {
				return {
					newStyleRanges: R.append({ ...styleRange, length: styleRange.length + charsAdded }, accumulator.newStyleRanges),
					beforeCharStyleRanges: false,
					beforeTailingStyleRanges: true
				};
			}
			return {
				newStyleRanges: R.append({ ...styleRange, offset: styleRange.offset + charsAdded }, accumulator.newStyleRanges),
				beforeCharStyleRanges: false,
				beforeTailingStyleRanges: false,
			}
		},
		{ newStyleRanges: [], beforeCharStyleRanges: true, beforeTailingStyleRanges: true }, // initial value
	)
)(styleRanges);

const deleteCharFromText = ({ text, index }) => {
	const beginning = R.slice(0, index, text);
	const end = R.slice(index + 1, Infinity, text);
	return beginning + end;
}

const deleteCharFromBlock = ({ block, charIndexWithinBlock = 0 }) => {
	const { newStyleRanges } = accomodateCharInStyleRanges({
      charPosition: charIndexWithinBlock,
      styleRanges: block.inlineStyleRanges,
      charsAdded: -1,
   });

	const newText = deleteCharFromText({ text: block.text, index: charIndexWithinBlock });

	return R.pipe(
		R.assoc('inlineStyleRanges', newStyleRanges),
		R.assoc('text', newText), 
	)(block);
}

const addCharToText = ({ index, text, char }) => R.pipe(
	R.splitAt,
	([beginning, end]) => beginning + char + end
)(index, text);

const addCharToBlock = ({ block, charIndexWithinBlock = 0, char = '' }) => {
	const { newStyleRanges } = accomodateCharInStyleRanges({
      charPosition: charIndexWithinBlock,
      styleRanges: block.inlineStyleRanges,
      charsAdded: 1,
   });

	const newText = addCharToText({ text: block.text, index: charIndexWithinBlock, char });

	return R.pipe(
		R.assoc('inlineStyleRanges', newStyleRanges),
		R.assoc('text', newText), 
	)(block);
}

const getBlockWithCursor = ({ cursorPosition, blocks, newTextArr }) => {
	if (isNothing(cursorPosition) || !arrayContainsSomething(blocks)) {
		log({ level: LOG.ERROR }, 'richTextHelpers--getBlockWithCursor missing cursorPosition and/or blocks');
		return { block: null, blockIndex: null, cursorPositionWithinBlock: null }
	}

	return reduceWithIndex(
		(accumulator, block, blockIndex) => {
			const { totalTextLength } = accumulator;
			const blockLength = R.pipe(R.prop('text'), R.length)(block);
			const newTextLength = R.pipe(R.prop(blockIndex), R.length)(newTextArr);
			
			if (newTextLength < blockLength) {
				if (cursorPosition === totalTextLength + blockLength) {
					// case 1: last char deleted
					return R.reduced({ block, cursorPositionWithinBlock: blockLength, blockIndex });
				}
				if (cursorPosition === totalTextLength) {
					// case 2: first char deleted
					return R.reduced({ block, cursorPositionWithinBlock: 0, blockIndex });
				}
				if (cursorPosition < totalTextLength + blockLength - 1 && cursorPosition > totalTextLength) {
					// case 3: deleted some char in the middle of the block
					return R.reduced({ block, cursorPositionWithinBlock: cursorPosition - totalTextLength, blockIndex });
				}
				log({ level: LOG.ERROR }, 'ERROR: richTextHelpers--getBlockWithCursor found the block with a deleted character, but could not find which character');
			}
		
			if (newTextLength > blockLength) {
				if (cursorPosition === totalTextLength + blockLength + 1) {
					// case 4: added char to end of line
					return R.reduced({ block, cursorPositionWithinBlock: blockLength + 1, blockIndex });
				}
		
				// case 5: added a char before the end of the line
				return R.reduced({ block, cursorPositionWithinBlock: cursorPosition - totalTextLength, blockIndex });
			}

			if (cursorPosition <= totalTextLength + blockLength && newTextLength === blockLength) {
				// case 6: we are probably adding a newline in the middle of the block, so as yet no char has been added or deleted
				return R.reduced({ block, cursorPositionWithinBlock: cursorPosition - totalTextLength, blockIndex });
			}
		
			if (newTextLength === blockLength) {
				// we are not in the block with the added/deleted char, so move on to the next block
				return { totalTextLength: totalTextLength + blockLength + BLOCK_END_CHAR_LENGTH }
			}
		},
		{ totalTextLength: 0 }, // initial value
		blocks
	);
}

const combineTwoBlocksStyles = blocks => {
	const block1Styles = R.path([0, 'inlineStyleRanges'], blocks);
	const block1Length = R.pipe(R.path([0, 'text']), R.length)(blocks);
	const block2Styles = R.path([1, 'inlineStyleRanges'], blocks);
	const block2SytlesUpdated = R.map(styleRange => R.pipe(
			R.prop('offset'),
			R.add(block1Length),
			R.assoc('offset', R.__, styleRange)
		)(styleRange), 
	block2Styles);
	return R.unnest([block1Styles, block2SytlesUpdated]);
}

const isBlockKeyInList = ({ block, keyList }) => R.pipe(
	R.prop('key'),
	blockKey => R.find(key => key === blockKey, keyList),
	isSomething
)(block);


const categorizeBlocksForCombination = ({ blocks, combinedBlocksKeys }) => R.reduce(
	(accumulator, block) => {
		const { beforeCombinedBlock, afterCombinedBlock, headBlocks, combinedBlocks, tailBlocks } = accumulator;
		if (beforeCombinedBlock && !afterCombinedBlock) {
			if (isBlockKeyInList({ block, keyList: combinedBlocksKeys })) {
				return {
					...accumulator,
					combinedBlocks: R.append(block,combinedBlocks),
					beforeCombinedBlock: false, 
					afterCombinedBlock: false
				}
			}
			return { 
				...accumulator,
				headBlocks: R.append(block, headBlocks),
			}
		}
		if (!beforeCombinedBlock && !afterCombinedBlock) {
			if (isBlockKeyInList({ block, keyList: combinedBlocksKeys })) {
				return {
					...accumulator,
					combinedBlocks: R.append(block,combinedBlocks),
				}
			}
			return {
				...accumulator,
				tailBlocks: R.append(block, tailBlocks),
				beforeCombinedBlock: false, 
				afterCombinedBlock: true,
			}
		}
		return {
			...accumulator,
			tailBlocks: R.append(block, tailBlocks),
		}
	},
	{ headBlocks: [], combinedBlocks: [], tailBlocks: [], beforeCombinedBlock: true, afterCombinedBlock: false }, //initial value
	blocks
);

const addKeyToList = ({ blocks, index, keyList = [] }) => R.pipe(
	R.prop(index),
	R.prop('key'),
	R.append(R.__, keyList)
)(blocks);

const replaceBlockWithDividedBlocks = ({ blocks, newBlock1, newBlock2 }) => R.reduce(
	(accumulator, block) => R.prop('key', block) === R.prop('key', newBlock1)
		? R.pipe(
			R.append(newBlock1),
			R.append(newBlock2)
		)(accumulator)
		: R.append(block, accumulator), 
	[], 
	blocks
);

const divideStyleRangesInTwo = ({ styleRanges, cursorPositionWithinBlock }) => {
	const { styleRangesBeforeDivide, styleRangesAfterDivide } = R.reduce(
		(accumulator, styleRange) => {
			if (cursorPositionWithinBlock <= styleRange.offset) {
				// case 1: split is before the styleRange
				return { 
					...accumulator,
					styleRangesAfterDivide: R.append(
						{ 
							...styleRange,
							offset: styleRange.offset - cursorPositionWithinBlock
						}, 
						accumulator.styleRangesAfterDivide
					)
				}
			}

			const originalStyleRangeEnd = styleRange.offset + styleRange.length;

			if (originalStyleRangeEnd <= cursorPositionWithinBlock) {
				// case 2: split is after the styleRange
				return { 
					...accumulator,
					styleRangesBeforeDivide: R.append(styleRange, accumulator.styleRangesBeforeDivide)
				}
			}

			// case 3: split is in the middle of the styleRange
			return {
				styleRangesBeforeDivide: R.append(
					{
						...styleRange, // offset and style are the same
						length: cursorPositionWithinBlock - styleRange.offset,
					}, 
					accumulator.styleRangesBeforeDivide
				),

				styleRangesAfterDivide: R.append(
					{
						...styleRange, // style is the same
						offset: 0,
						length: originalStyleRangeEnd - cursorPositionWithinBlock,
					}, 
					accumulator.styleRangesAfterDivide
				)
			}
		}, 
		{ styleRangesBeforeDivide: [], styleRangesAfterDivide: [] }, 
		styleRanges
	);

	return [
		sortStyleRanges(styleRangesBeforeDivide),
		sortStyleRanges(styleRangesAfterDivide),
	];
}

const divideBlockInTwo = ({ block, cursorPositionWithinBlock, originalBlocks }) => {
	const originalKeys = R.map(block => R.prop('key', block), originalBlocks);
	const [ styleRangesBeforeDivide, styleRangesAfterDivide ] = divideStyleRangesInTwo({ styleRanges: R.prop('inlineStyleRanges', block), cursorPositionWithinBlock });
	const [ textBeforeDivide, textAfterDivide ] = R.pipe(R.prop('text'), R.splitAt(cursorPositionWithinBlock))(block);
	return [
		{
			text: textBeforeDivide,
			inlineStyleRanges: styleRangesBeforeDivide,
			key: R.prop('key', block), // the first block keeps the original key
		},
		{
			text: textAfterDivide,
			inlineStyleRanges: styleRangesAfterDivide,
			key: R.pipe(getRandomKey, R.prop('key'))({ usedKeys: originalKeys }),
		}
	]
}

const combineTwoBlocks = ({ blocks, newTextArr, cursorPosition }) => {
	// find which section of newTextArr contains the cursor
	// the combined blocks must therefore be the block at that same index, plus the block after it
	const combinedBlockIndex = reduceWithIndex(
		(accumulator, newText, index) => {
			const textLength = accumulator.currentTextLength + newText.length + 1; // adding 1 to account for the \n char at the end of the text
			if (cursorPosition <= textLength) {
				return R.reduced(index);
			}
			return { currentTextLength: textLength }
		},
		{ currentTextLength: 0 },
		newTextArr
	);

	const combinedBlocksKeys = R.pipe(
		addKeyToList,
		keyList => addKeyToList({ blocks, index: combinedBlockIndex + 1, keyList })
	)({ blocks, index: combinedBlockIndex });

	const { headBlocks, combinedBlocks, tailBlocks } = categorizeBlocksForCombination({ blocks, combinedBlocksKeys });

	const combinedBlockText = R.reduce(
		(accumulator, block) => R.pipe(
			R.prop('text'),
			R.concat(accumulator)
		)(block),
		'',
		combinedBlocks
	);

	const combinedStyles = combineTwoBlocksStyles(combinedBlocks);

	const combinedBlock = { 
		key: R.path([0, 'key'], combinedBlocks),
		text: combinedBlockText,
		inlineStyleRanges: combinedStyles
	}

	return R.unnest([headBlocks, combinedBlock, tailBlocks]);
}

export const updateEditedChar = ({ cursorPosition, newText, formattedText, isNewline }) => {
	const newTextArr = R.split(NEWLINE_REGEX, newText);
	
	const { blocks } = decodeFormattedText(formattedText);

	if (blocks.length === newTextArr.length + 1) {
		// case 1: a newline char has been deleted
		return {
			formattedText: R.pipe(
				combineTwoBlocks,
				R.assoc('blocks', R.__, formattedText)
			)({ blocks, newTextArr, cursorPosition }),
			cursorPosition: cursorPosition - 1,
		};
	}

	if (blocks.length !== newTextArr.length) {
		log({ level: LOG.WARN }, 'richTextHelpers--updateEditedChar error: the blocks length is', blocks?.length, 'whereas the number of lines of text is', newTextArr?.length);
		return { formattedText, cursorPosition }; // MAYBE is this the right way to handle this error? will we ever see this error?
	}

	const { block, cursorPositionWithinBlock, blockIndex } = getBlockWithCursor({ cursorPosition, blocks, newTextArr });

	if (isNewline) {
		// case 2: a newline has been added
		const [ newBlock1, newBlock2 ] = divideBlockInTwo({ block, cursorPositionWithinBlock, originalBlocks: blocks }); // note: newBlock1 will have the same key as the original block
		const newBlocks = replaceBlockWithDividedBlocks({ blocks, newBlock1, newBlock2 });
		return { formattedText: {...formattedText, blocks: newBlocks}, cursorPosition: cursorPosition + 1 };
	}

	const charWasAdded = block.text.length + 1 === newTextArr[blockIndex].length;
	const charWasDeleted = block.text.length - 1 === newTextArr[blockIndex].length;

	const newBlock = charWasAdded
		? R.pipe( // case 3: a char has been added 
			R.nth,
			char => addCharToBlock({ block, charIndexWithinBlock: cursorPositionWithinBlock, char })
		)(cursorPosition, newText)
		: charWasDeleted // case 4: a char has been deleted 
			? deleteCharFromBlock({ block, charIndexWithinBlock: cursorPositionWithinBlock - 1 }) // case 4: a char has been deleted
			: block // case5: should never happen - neither added nor deleted a single character
	const newFormattedText = replaceBlockInFormattedText({ newBlock, formattedText });
	return {
		formattedText: newFormattedText,
		cursorPosition: charWasAdded ? cursorPosition + 1 : charWasDeleted ? cursorPosition - 1 : cursorPosition,
	}
}