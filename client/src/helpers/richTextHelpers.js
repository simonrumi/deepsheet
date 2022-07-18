import React from 'react';
import htmlReactParser from 'html-react-parser';
import * as R from 'ramda';
import managedStore from '../store';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import { isSomething, isNothing, arrayContainsSomething, reduceWithIndex, ifThenElse } from '../helpers';
import { encodeText, decodeText } from './cellHelpers';
import { stateFocusEditor, cellText, cellFormattedText } from './dataStructureHelpers';
import { BLOCK_SEPARATOR, BLOCK_SEPARATOR_REGEX, NEWLINE_REGEX, STYLE_TAGS } from '../constants';

export const getInitialEditorState = cell => ifThenElse({
	ifCond: R.pipe(cellFormattedText, isSomething),
	thenDo: [ cellFormattedText, decodeFormattedText, convertFromRaw, EditorState.createWithContent ],
	elseDo: [ cellText, ContentState.createFromText, EditorState.createWithContent ],
	params: { ifParams: cell, thenParams: cell, elseParams: cell }
});

export const encodeFormattedText = formattedText => R.pipe(
	R.prop('blocks'),
	// encode the text within each block
	R.map(block => R.pipe(
		R.prop('text'),
		encodeText,
		R.assoc('text', R.__, block)
	)(block)),
	R.assoc('blocks', R.__, formattedText) // put the blocks back into formattedText
)(formattedText);

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

const stylesOverlap = styleRanges => {
	console.log('richTextHelpers--stylesOverlap got styleRanges', styleRanges);
	const firstStyleRange = R.head(styleRanges);
	const remainingStyleRanges = R.slice(1, Infinity, styleRanges);
	if (!arrayContainsSomething(remainingStyleRanges)) {
		console.log('richTextHelpers--stylesOverlap found no remainingStyleRanges so returning false');
		return false;
	}
	const hasOverlap = R.reduce(
		(accumulator, comparisonStyleRange) => {
			console.log('richTextHelpers--stylesOverlap inside reduce got comparisonStyleRange.offset', comparisonStyleRange.offset, 
			'firstStyleRange.offset', firstStyleRange.offset,
			'firstStyleRange.offset + firstStyleRange.length', (firstStyleRange.offset + firstStyleRange.length)
			);
			return comparisonStyleRange.offset >= firstStyleRange.offset && 
				comparisonStyleRange.offset < (firstStyleRange.offset + firstStyleRange.length)
				? R.reduced(true)
				: accumulator; // which is false
		},
		false, // initilly assume no overlap
		remainingStyleRanges
	);
	if (hasOverlap) {
		console.log('richTextHelpers--stylesOverlap got hasOverlap true so returning true');
		return true;
	}
	return stylesOverlap(remainingStyleRanges);
}

const makeStartTagWithStyles = styles => R.pipe(
	R.reduce(
		(accumulator, style) => R.pipe(
			R.concat(R.__, ' '), 
			R.concat(R.__, R.prop(style, STYLE_TAGS))
		)(accumulator),
		'<span className="', // initial value
	),
	R.concat(R.__, '">')
)(styles);

const END_TAG = '</span>';

const applyStyling = ({ plainText, styleRanges }) => {
	if (!arrayContainsSomething(styleRanges)) {
		return { lastOffset: Infinity, formattedText: plainText }
	}
	console.log('richTextHelpers--applyStyling got plainText', plainText, 'styleRanges', styleRanges);
	const firstOffset = R.pipe(
		R.head,
		R.tap(data => console.log('richTextHelpers--applyStyling getting firstOffset, got R.head', data)),
		R.prop('offset'),
		R.tap(data => console.log('richTextHelpers--applyStyling getting firstOffset, got R.prop(offset)', data)),
	)(styleRanges);
	const unformattedStartingText = R.slice(0, firstOffset, plainText);
	console.log('richTextHelpers--applyStyling got firstOffset', firstOffset, 'unformattedStartingText', unformattedStartingText);
	return R.reduce(
		(accumulator, styleRange) => {
			console.log('richTextHelpers--applyStyling inside reduce got accumulator', accumulator, 'styleRange', styleRange);
			const unstyledHeadText = R.slice(accumulator.lastOffset, styleRange.offset, plainText);
			const endOfTextToStyle = styleRange.offset + styleRange.length
			const textToStyle = R.slice(styleRange.offset, endOfTextToStyle, plainText);
			const formattedText =
				accumulator.formattedText +
				unstyledHeadText +
				makeStartTagWithStyles(styleRange.styles) +
				textToStyle +
				END_TAG;
			console.log('richTextHelpers--applyStyling inside reduce got unstyledHeadText', unstyledHeadText,
				'endOfTextToStyle', endOfTextToStyle,
				'textToStyle', textToStyle,
				'so formattedText is', formattedText
			);
			return {
				...accumulator,
				lastOffset: endOfTextToStyle,
				formattedText
			};
		},
		{ lastOffset: firstOffset, formattedText: unformattedStartingText }, // initial value
		styleRanges
	);
}

const addStylesToStyleRanges = styleRanges => R.map(
	styleRange => ({ ...styleRange, styles: [ styleRange.style ] }),
	styleRanges
);

const finalizeStyleRange = ({ styleRange, charPosition }) => isNothing(styleRange) 
	? null
	: ({
		...styleRange, // keep existing styles and offset
		length: charPosition - styleRange.offset,
	});

const createStyleRange = ({ offset, styleRanges }) => ({
	offset,
	length: 1,
	styles: R.map(styleRange => styleRange.style, styleRanges)
})

const compareRangeSets = (rangeSet1, rangeSet2) => {
	console.log('richTextHelpers--compareRangeSets got rangeSet1', rangeSet1, 'rangeSet2', rangeSet2);
	if(rangeSet1.length !== rangeSet2.length) {
		console.log('richTextHelpers--compareRangeSets got different lengths so will return false');
		return false;
	}
	const { rangeSetsMatch } = R.reduce(
		(accumulator, styleRange1) => {
			const indexOfMatchingStyleRange2 = R.findIndex(
				styleRange2 => styleRange1.offset === styleRange2.offset && styleRange1.length === styleRange2.length && styleRange1.style === styleRange2.style,
				accumulator.remainingRanges
			);
			return indexOfMatchingStyleRange2 >= 0 
				? {
					...accumulator,
					remainingRanges: R.remove(indexOfMatchingStyleRange2, 1, accumulator.remainingRanges)
				}
				: R.reduced({
					...accumulator,
					rangeSetsMatch: false,
				})
		},
		{ rangeSetsMatch: true, remainingRanges: rangeSet2 }, // initially assume range sets are identical
		rangeSet1
	);
	console.log('richTextHelpers--compareRangeSets an in-depth comparison of the rangeSets will return', rangeSetsMatch);
	return rangeSetsMatch;
}

const isCharInRange = ({ charPosition, styleRange }) => charPosition >= styleRange.offset && charPosition < styleRange.offset + styleRange.length;
const whichRangesIsCharIn = ({ charPosition, styleRanges }) => R.filter(styleRange => isCharInRange({ charPosition, styleRange }), styleRanges);

const splitStyleRanges = ({ styleRanges, plainText }) => {
	const { updatedStyleRanges } = reduceWithIndex(
		(accumulator, char, charPosition) => {
			const newCharRangeSet = whichRangesIsCharIn({ charPosition, styleRanges });
			console.log('richTextHelpers--splitStyleRanges inside reduceWithIndex got accumulator', accumulator,
			'charPosition', charPosition,
			'newCharRangeSet', newCharRangeSet);
			if (compareRangeSets(newCharRangeSet, accumulator.currentCharRangeSet)) {
				console.log(
               'richTextHelpers--splitStyleRanges inside reduceWithIndex, newCharRangeSet and currentCharRangeSet are equal, charPosition',
               charPosition,
               'plainText.length',
               plainText.length
            );
				if (charPosition + 1 >= plainText.length) {
					// note that normally we finalize a styleRange when we are at the beginning of the next styleRange, 
					// but in this case we are at the end of plainText, 
					// so we just have to pretend we're one charPosition further along than we really are
					const updatedStyleRange = finalizeStyleRange({ styleRange: accumulator.currentStyleRange, charPosition: charPosition + 1 });
					console.log(
                  'richTextHelpers--splitStyleRanges inside reduceWithIndex got to the end of the plainText so called finalizeStyleRange, with accumulator.currentStyleRange',
                  accumulator.currentStyleRange,
                  'to get updatedStyleRange',
                  updatedStyleRange
               );
					return {
						...accumulator,
						updatedStyleRanges: isNothing(updatedStyleRange) ? accumulator.updatedStyleRanges : R.append(updatedStyleRange, accumulator.updatedStyleRanges),
					}
				}
				console.log('richTextHelpers--splitStyleRanges newCharRangeSet and currentCharRangeSet are equal so returning accumulator', accumulator);
				return accumulator;
			}
			console.log('richTextHelpers--splitStyleRanges newCharRangeSet and currentCharRangeSet are not equal so about to call finalizeStyleRange')
			const updatedStyleRange = finalizeStyleRange({ styleRange: accumulator.currentStyleRange, charPosition });
			const newStyleRange = createStyleRange({ offset: charPosition, styleRanges: newCharRangeSet });
			const updatedStyleRanges = charPosition + 1 >= plainText.length 
				? isSomething(updatedStyleRange) // the edge case where we are at the end of plainText with a one-char style
					? R.concat(accumulator.updatedStyleRanges, [ updatedStyleRange, newStyleRange ]) 
					: R.append(newStyleRange, accumulator.updatedStyleRanges)
				: isSomething(updatedStyleRange) // the normal case
					? R.append(updatedStyleRange, accumulator.updatedStyleRanges)
					: accumulator.updatedStyleRanges
			console.log('richTextHelpers--splitStyleRanges will start a new range, got updatedStyleRange', updatedStyleRange, 'newStyleRange', newStyleRange, 'updatedStyleRanges', updatedStyleRanges);
			return {
            ...accumulator,
            currentCharRangeSet: newCharRangeSet,
            updatedStyleRanges,
            currentStyleRange: newStyleRange,
         };			
		},
		{ currentStyleRange: null, currentCharRangeSet: [], updatedStyleRanges: [] }, // the initial value
		plainText, // the list to iterate over
	);
	console.log('richTextHelpers--splitStyleRanges will return updatedStyleRanges', updatedStyleRanges);
	return updatedStyleRanges;
}

const sortStyleRanges = R.sort((styleRange1, styleRange2) =>
   styleRange1.offset < styleRange2.offset 
		? -1 
		: styleRange1.offset > styleRange2.offset ? 1 : 0
);

const convertOneBlockToJsx = block => {
	// note that inlineStyleRanges look like this
	// [{offset: 6, length: 4, style: 'BOLD'}, ...]
	// but we need to convert them to this sort of thing to work with:
	// [{offset: 6, length: 4, styles: ['BOLD', 'UNDERLINE'] }, ...]
	const plainText = block.text;
	console.log('richTextHelpers--convertOneBlockToJsx about to call stylesOverlap');
	const sortedStyleRanges = sortStyleRanges(block.inlineStyleRanges);
	const updatedStyleRanges = stylesOverlap(sortedStyleRanges) 
		? splitStyleRanges({ styleRanges: sortedStyleRanges, plainText })
		: addStylesToStyleRanges(sortedStyleRanges);
	console.log('richTextHelpers--convertOneBlockToJsx got updatedStyleRanges', updatedStyleRanges);
	const { lastOffset, formattedText } = applyStyling({ plainText, styleRanges: updatedStyleRanges });
	return formattedText + R.slice(lastOffset, Infinity, plainText) + BLOCK_SEPARATOR;
}

export const convertBlocksToJsx = blocks => {
	console.log('richTextHelpers--convertBlocksToJsx got blocks', blocks);
	const blocksAsHtml = R.map(convertOneBlockToJsx, blocks);
	console.log('richTextHelpers--convertBlocksToJsx got blocksAsHtml', blocksAsHtml);
	return R.pipe(
		R.last,
		lastBlock => lastBlock.replace(BLOCK_SEPARATOR_REGEX, ''), // every block has a separator tag on the end, but the last block doesn't need it
		R.append(R.__, R.slice(0, -1, blocksAsHtml)), 
		R.map(htmlReactParser)
	)(blocksAsHtml);
}


/**
 * Draft.js has a generateRandomKey function, but hard to find how to use it due to missing documentation
 * But did find their code for it here:
 * https://github.com/facebook/draft-js/blob/main/src/model/keys/generateRandomKey.js
 * and have based the following code on that
 */
const getRandomKey = ({ remainingKeys = [], usedKeys = [] }) => {
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
	console.log('richTextHelpers--splitBlock got textArr', textArr, 'block', block, 'keys', keys);

	const basicBlock = {
		data: {},
		depth: 0,
		entityRanges: [],
		inlineStyleRanges: [],
		key: null,
		text: '',
		type: 'unstyled'
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
						console.log('richTextHelpers--splitBlock, case 1 - block starts before the style range and ends in the middle of it');
						return R.append({
							...styleRange,
							offset: styleRange.offset - blockOffset,
							length: text.length - (styleRange.offset - blockOffset), 
						}, accumulator)
					}
					
					// case 2 - block starts in the middle, or start of the style range, and ends after it
					if (styleRange.offset <= blockOffset && blockOffset < endStyleRange && endStyleRange < endBlock) {
						console.log('richTextHelpers--splitBlock, case 2 - block starts in the middle of the style range and ends after it');
						return R.append({
							...styleRange,
							offset: 0,
							length: styleRange.length - (blockOffset - styleRange.offset),
						}, accumulator);
					}

					// case 3 - block starts at the same point as the style range, or in the middle of it, and ends in the middle or at the exact end of the style range
					if (styleRange.offset <= blockOffset && endBlock <= endStyleRange) {
						console.log('case 3 - block starts at the same point as the style range, or in the middle of it, and ends in the middle or at the exact end of the style range');
						return R.append({
							...styleRange,
							offset: 0,
							length: text.length,
						}, accumulator);
					}

					// case 4 - block starts before and ends after the style range
					if (blockOffset < styleRange.offset && endStyleRange < endBlock) {
						console.log('richTextHelpers--splitBlock, case 4 - block starts before and ends after the style range');
						return R.append({
							...styleRange,
							offset: styleRange.offset - blockOffset,
						}, accumulator);
					}

					// case 5 - block comes before or after style range
					if (endBlock <= styleRange.offset || blockOffset >= endStyleRange) { 
						console.log('richTextHelpers--createNewStyleRangesForPaste, case 5 - block comes before or after style range');
						return accumulator
					}
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
	console.log('richTextHelpers--splitBlock created blocks', blocks);
	return blocks;
};

const concatenateBlocks = ({ blocksInSelection, editorState }) => {
	const selectionState = editorState.getSelection();
	const selectionStart = selectionState.getStartOffset();
	const selectionEndWithinLastBlock = selectionState.getEndOffset();

	return R.reduce(
		(accumulator, block) => {
			console.log('richTextHelpers--concatenateBlocks got block', block);
			const updatedText = R.pipe(
				R.prop('text'),
				R.concat(R.prop('text', accumulator))
			)(block);

			const updatedStyles = R.map(
				styleRange => R.assoc('offset', styleRange.offset + accumulator.text.length, styleRange)
			)(block.inlineStyleRanges);
			console.log('richTextHelpers--concatenateBlocks got updatedStyles', updatedStyles, 'for block', block);

			// since the selection end is relative to the start of the last block that we are concatenating
			// we keep updating the selection end to be the length of all the text so far (not including the current block)
			// plus the selection end (which is within the last block)
			// ...when we get to the last block, this will give us the right number
			const updatedSelectionEnd = R.pipe(
				R.prop('text'), 
				R.length,
				R.add(selectionEndWithinLastBlock)
			)(accumulator);

			const newBlockOffsets = R.pipe(
				R.prop('text'), 
				R.length, 
				R.append(R.__, accumulator.blockOffsets)
			)(accumulator);

			const newKeys = R.pipe(
				R.prop('key'),
				R.append(R.__, accumulator.keys)
			)(block)

			return R.pipe(
				R.prop('inlineStyleRanges'),
				R.concat(R.__, updatedStyles),
				R.assoc('inlineStyleRanges', R.__, accumulator),
				R.assoc('text', updatedText),
				R.assoc('selectionEnd', updatedSelectionEnd),
				R.assoc('blockOffsets', newBlockOffsets),
				R.assoc('keys', newKeys),
				R.assoc('key', R.head(newKeys)), //use the first key as the key for the concatentated block
			)(accumulator)
		},
		// initial values:
		{ 
			data: {}, depth: 0, entityRanges: [], type: 'unstyled', // these empty values are required by Draft.js but we are not using them
			keys: [], // this will collect the keys from each block for re-use later 
			text: '', // this will hold the string of all the blocks' text concatenated together
			blockOffsets: [], // this will hold where each block originally started relative to the beginning of the concatenated text
			selectionStart, // this will never change
			selectionEnd: 0, 
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

const categorizeBlocks = ({ rawState, selectionState }) => {
	const anchorKey = selectionState.getAnchorKey(); // key for the start of the selection
	const focusKey = selectionState.getFocusKey(); // key for the end of the selection
	const isBackward = selectionState.getIsBackward();
	const firstKey = isBackward ? focusKey : anchorKey;
	const lastKey = isBackward ? anchorKey : focusKey;
	console.log('richTextHelpers--categorizeBlocks got anchorKey', anchorKey, 'focusKey', focusKey, 'isBackward', isBackward);

	// blocks are in order, so divide them up depending on where the blocks with the firstKey and with the lastKey are found
	return R.reduce(
      (accumulator, block) => {
			switch(accumulator.currentAssumedPosition) {
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
			}
         R.prop('key', block);
      },
      {
         blocksBeforeSelection: [],
         blocksInSelection: [],
         blocksAfterSelection: [],
         currentAssumedPosition: 'before_selection',
      }, // initial values
      R.prop('blocks', rawState)
   );
}

const createNewStyleRangesForPaste = ({ startSelection, endSelection, styleRange, textToPaste }) => {
	const endStyleRange = styleRange.offset + styleRange.length;
	console.log('richTextHelpers--createNewStyleRangesForPaste got startSelection', startSelection, 'endSelection', endSelection, 'styleRange', styleRange, 'textToPaste', textToPaste);
	const textLength = R.pipe(R.replace, R.length)(NEWLINE_REGEX, '', textToPaste); // want to ignore any newlines for calculation of style range offsets, as we will split into multiple blocks if there are newlines
	console.log('richTextHelpers--createNewStyleRangesForPaste got textLength', textLength);

	// case 1 - selection starts before the style range and ends in the middle or at the end of the style range
	if (startSelection < styleRange.offset && endSelection > styleRange.offset && endSelection <= endStyleRange) {
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 1 - selection starts before the style range and ends in the middle of it');
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
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 2 - selection starts in the middle of the style range and ends after it');
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
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 3a - selection starts & ends in the middle of the style range');
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
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 3b - selection & style range start at the same point, and the selection ends in the middle of the style range');
		return R.pipe(
			R.subtract,
			R.assoc('length', R.__, styleRange),
			R.assoc('offset', startSelection + textLength),
			R.append(R.__, [])
		)(endStyleRange, endSelection);
	}

	// case 3c - selection starts in the middle of the style range, and the selection & style range end at the same point
	if (styleRange.offset < startSelection && endSelection === endStyleRange) {
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 3c - selection starts in the middle of the style range, and the selection & style range end at the same point');
		return R.pipe(
			R.subtract,
			R.assoc('length', R.__, styleRange),
			R.append(R.__, [])
		)(startSelection, styleRange.offset);
	}

	// case 3d - selection and style range start and end at the same points
	if (styleRange.offset === startSelection && endSelection === endStyleRange) {
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 3d - selection and style range start and end at the same points');
		return [];
	}

	// case 4 - selection starts before and ends after the style range
	if (startSelection < styleRange.offset && endStyleRange < endSelection) {
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 4 - selection starts before and ends after the style range');
		return [];
	}

	// case 5a - selection comes before style range
	if (endSelection <= styleRange.offset) { 
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 5a - selection comes before style range');
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
		console.log('richTextHelpers--createNewStyleRangesForPaste, case 5b - selection comes after style range');
		return [styleRange];
	}
}

/**
 * pasteTextWithinOneBlock needs either
 * editorState
 * OR
 * rawState, start (of selection), & end (of selection) 
 * the rest of the params are required
 */
const pasteTextWithinOneBlock = ({ targetBlockKey, editorState, rawState, start, end, textToPaste }) => {
	rawState = rawState || convertToRaw(editorState.getCurrentContent());
	const selectionState = editorState?.getSelection();
	start = start || selectionState.getStartOffset();
	end = end ||selectionState.getEndOffset();
	const blockText = editorState.getCurrentContent().getBlockForKey(targetBlockKey).getText();
	const beforeSelection = R.slice(0, start, blockText);
	const afterSelection = R.slice(end, Infinity, blockText);
	const newText = beforeSelection + textToPaste + afterSelection;
	console.log('richTextHelpers--pasteTextWithinOneBlock newText', newText, 'blockText', blockText, 'rawState', rawState, 	'start', start, 'end', end,);
	const updatedBlocks = R.map(
		block => {
			if (block.key === targetBlockKey) {
				const selectionStyleRanges = R.prop('inlineStyleRanges', block);
				console.log('richTextHelpers--pasteTextWithinOneBlock got selectionStyleRanges', selectionStyleRanges);
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
						R.assoc('text', newText)
					)(selectionStyleRanges)
					: R.assoc('text', newText, block); // no styles in the selection, so just return the block with the text replaced
			}
			return block;
		},
		rawState.blocks
	);
	return R.pipe(
		R.assoc('text', newText),
		R.assoc('blocks', updatedBlocks),
		convertFromRaw,
		EditorState.createWithContent,
	)(rawState);
}

export const addPastedTextToEditorState = textToPaste => {
	console.log('richTextHelpers--addPastedTextToEditorState got textToPaste', textToPaste);
	const editorState = stateFocusEditor(managedStore.state);
	const selectionState = editorState.getSelection();
	const anchorKey = selectionState.getAnchorKey(); // key for the start of the selection
	const focusKey = selectionState.getFocusKey(); // key for the end of the selection
	const currentContent = editorState.getCurrentContent();
	const anchorBlock = currentContent.getBlockForKey(anchorKey);
	const focusBlock = currentContent.getBlockForKey(focusKey);
	const rawState = convertToRaw(editorState.getCurrentContent());
	
	console.log(
      'richTextHelpers--addPastedTextToEditorState got anchorBlock', anchorBlock,
		'focusBlock', focusBlock,
		'textToPaste', textToPaste,
		'editorState', editorState,
		'rawState', rawState
   );
	
	const { blocksBeforeSelection, blocksInSelection, blocksAfterSelection } = categorizeBlocks({ rawState, selectionState });
	console.log(
      'richTextHelpers--addPastedTextToEditorState got blocksBeforeSelection', blocksBeforeSelection,
      'blocksInSelection', blocksInSelection,
      'blocksAfterSelection', blocksAfterSelection,
   );
	
	const selectionBlock = concatenateBlocks({ blocksInSelection, editorState });
	console.log('richTextHelpers--addPastedTextToEditorState got selectionBlock', selectionBlock);
	const { selectionStart, selectionEnd, key, keys } = selectionBlock;

	const selectionBlockRawState = R.assoc('blocks', [selectionBlock], rawState);
	return R.pipe(
		R.assoc,
		convertFromRaw,
		EditorState.createWithContent,
		selectionBlockEditorState => pasteTextWithinOneBlock({
			targetBlockKey: key,
			start: selectionStart,
			end: selectionEnd, 
			rawState: selectionBlockRawState,
			editorState: selectionBlockEditorState,
			textToPaste,
		}),
		stateWithNewText => convertToRaw(stateWithNewText.getCurrentContent()),
		R.prop('blocks'),
		R.head,
		R.tap(data => console.log('richTextHelpers--addPastedTextToEditorState got combined block with pasted text', data)),
		block => splitBlock({ block, keys }),
		R.tap(data => console.log('richTextHelpers--addPastedTextToEditorState got slpit blocks', data)),
		newBlocks => R.unnest([ blocksBeforeSelection, newBlocks, blocksAfterSelection ]),
		R.tap(data => console.log('richTextHelpers--addPastedTextToEditorState combined blocks before and after selection with split blocks to get', data)),
		R.assoc('blocks', R.__, rawState),
		R.tap(data => console.log('richTextHelpers--addPastedTextToEditorState created the rawState (to be converted to editorState):', data)),
		convertFromRaw,
		EditorState.createWithContent,
	)('blocks', [selectionBlock], rawState); // the 1st function in the pipe will put the selectionBlock into the rawState
}