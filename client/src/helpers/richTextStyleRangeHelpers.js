import * as R from 'ramda';
import { isSomething, isNothing, arrayContainsSomething, reduceWithIndex } from '../helpers';
import { BLOCK_END_CHAR_LENGTH, STYLE_TAGS } from '../constants';

/***
 * helpers for style ranges
 */

 export const stylesOverlap = styleRanges => {
	const firstStyleRange = R.head(styleRanges);
	const remainingStyleRanges = R.slice(1, Infinity, styleRanges);
	if (!arrayContainsSomething(remainingStyleRanges)) {
		return false;
	}
	const hasOverlap = R.reduce(
		(accumulator, comparisonStyleRange) => {
			return comparisonStyleRange.offset >= firstStyleRange.offset && 
				comparisonStyleRange.offset < (firstStyleRange.offset + firstStyleRange.length)
				? R.reduced(true)
				: accumulator; // which is false
		},
		false, // initilly assume no overlap
		remainingStyleRanges
	);
	if (hasOverlap) {
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

export const applyStyling = ({ plainText, styleRanges }) => {
	if (!arrayContainsSomething(styleRanges)) {
		return { lastOffset: Infinity, formattedText: plainText }
	}
	const firstOffset = R.pipe(
		R.head,
		R.prop('offset'),
	)(styleRanges);
	const unformattedStartingText = R.slice(0, firstOffset, plainText);
	return R.reduce(
		(accumulator, styleRange) => {
			const unstyledHeadText = R.slice(accumulator.lastOffset, styleRange.offset, plainText);
			const endOfTextToStyle = styleRange.offset + styleRange.length
			const textToStyle = R.slice(styleRange.offset, endOfTextToStyle, plainText);
			const formattedText =
				accumulator.formattedText +
				unstyledHeadText +
				makeStartTagWithStyles(styleRange.styles) +
				textToStyle +
				END_TAG;
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

export const addStylesToStyleRanges = styleRanges => R.map(
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
	if(rangeSet1.length !== rangeSet2.length) {
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
	return rangeSetsMatch;
}

export const isCharInRange = ({ charPosition, styleRange }) => charPosition >= styleRange.offset && charPosition < styleRange.offset + styleRange.length;
const whichRangesIsCharIn = ({ charPosition, styleRanges }) => R.filter(styleRange => isCharInRange({ charPosition, styleRange }), styleRanges);

export const splitStyleRanges = ({ styleRanges, plainText }) => {
	const { updatedStyleRanges } = reduceWithIndex(
		(accumulator, char, charPosition) => {
			const newCharRangeSet = whichRangesIsCharIn({ charPosition, styleRanges });
			if (compareRangeSets(newCharRangeSet, accumulator.currentCharRangeSet)) {
				if (charPosition + 1 >= plainText.length) {
					// note that normally we finalize a styleRange when we are at the beginning of the next styleRange, 
					// but in this case we are at the end of plainText, 
					// so we just have to pretend we're one charPosition further along than we really are
					const updatedStyleRange = finalizeStyleRange({ styleRange: accumulator.currentStyleRange, charPosition: charPosition + 1 });
					return {
						...accumulator,
						updatedStyleRanges: isNothing(updatedStyleRange) ? accumulator.updatedStyleRanges : R.append(updatedStyleRange, accumulator.updatedStyleRanges),
					}
				}
				return accumulator;
			}
			const updatedStyleRange = finalizeStyleRange({ styleRange: accumulator.currentStyleRange, charPosition });
			const newStyleRange = createStyleRange({ offset: charPosition, styleRanges: newCharRangeSet });
			const updatedStyleRanges = charPosition + 1 >= plainText.length 
				? isSomething(updatedStyleRange) // the edge case where we are at the end of plainText with a one-char style
					? R.concat(accumulator.updatedStyleRanges, [ updatedStyleRange, newStyleRange ]) 
					: R.append(newStyleRange, accumulator.updatedStyleRanges)
				: isSomething(updatedStyleRange) // the normal case
					? R.append(updatedStyleRange, accumulator.updatedStyleRanges)
					: accumulator.updatedStyleRanges
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
	return updatedStyleRanges;
}

export const sortStyleRanges = R.sort((styleRange1, styleRange2) =>
   styleRange1.offset < styleRange2.offset 
		? -1 
		: styleRange1.offset > styleRange2.offset ? 1 : 0
);

const maybeAppendStyleRange = R.curry(
	(newStyleRange, styleRanges) => isSomething(newStyleRange) && R.prop('length', newStyleRange) > 0 ? R.append(newStyleRange, styleRanges) : styleRanges
);

const maybePrependStyleRange = R.curry(
	(newStyleRange, styleRanges) => isSomething(newStyleRange) && R.prop('length', newStyleRange) > 0 ? R.prepend(newStyleRange, styleRanges) : styleRanges
);

// TODO NEXT in here if any style has length 0 (or less) then remove it
// see BUG description in CellInPlaceEditor
const consolidateFirstTwoStyles = ({ matchingStyles, consolidatedStyles = [] }) => {
	if (matchingStyles.length === 0) {
		return consolidatedStyles;
	}
	if (matchingStyles.length === 1) {
		return maybeAppendStyleRange(matchingStyles[0], consolidatedStyles);
	}

	const anchorStyle = R.head(matchingStyles);
	if (R.prop('length', anchorStyle) === 0) {
		// skip this "anchor" style altogether as it has no length
		return consolidatedStyles;
	}
	const comparisonStyle = R.pipe(R.tail, R.head)(matchingStyles);
	const anchorStyleEnd = anchorStyle.offset + anchorStyle.length;
	const comparisonStyleEnd = comparisonStyle.offset + comparisonStyle.length;

	if (comparisonStyle.offset > anchorStyleEnd || anchorStyle.offset > comparisonStyleEnd) {
		// case 0: no overlap
		return consolidateFirstTwoStyles({ 
			matchingStyles: R.tail(matchingStyles), 
			consolidatedStyles: maybeAppendStyleRange(anchorStyle, consolidatedStyles), 
		});
	}

	if (comparisonStyle.offset < anchorStyle.offset) {
		if (comparisonStyleEnd <= anchorStyleEnd) {
			// case 1: the comparisonStyle starts before the anchorStyle and ends in the middle of it
			const combinedStyleRange = {
				...comparisonStyle, // keep the style and the offset as-is
				length: anchorStyleEnd - comparisonStyle.offset,
			}
			const newMatchingStyles = R.pipe(R.slice(2, Infinity), maybePrependStyleRange(combinedStyleRange))(matchingStyles);
			return consolidateFirstTwoStyles({ matchingStyles: newMatchingStyles, consolidatedStyles });
		}
		// case 2: the anchorStyle is completely inside the comparisonStyle
		const newMatchingStyles = R.pipe(R.slice(2, Infinity), maybePrependStyleRange(comparisonStyle))(matchingStyles);
		return consolidateFirstTwoStyles({ matchingStyles: newMatchingStyles, consolidatedStyles });
	}

	if (anchorStyleEnd < comparisonStyleEnd) {
		// case 3: the comparisonStyle starts in the middle of the anchorStyle and ends after it
		const combinedStyleRange = {
			...anchorStyle, // keep the anchorStyle offset and style
			length: comparisonStyleEnd - anchorStyle.offset,
		}
		const newMatchingStyles = R.pipe(R.slice(2, Infinity), maybePrependStyleRange(combinedStyleRange))(matchingStyles);
		return consolidateFirstTwoStyles({ matchingStyles: newMatchingStyles, consolidatedStyles });
	}

	// case 4: the anchorStyle completely contains the comparisonStyle,
	const newMatchingStyles = R.pipe(R.slice(2, Infinity), maybePrependStyleRange(anchorStyle))(matchingStyles);
	return consolidateFirstTwoStyles({ matchingStyles: newMatchingStyles, consolidatedStyles });
}

const consolidateStyleRanges = ({ blocks, newStyle }) => R.map(block => {
	const matchingStyles = R.pipe(
		R.prop('inlineStyleRanges'),
		R.filter(styleRange => styleRange.style === newStyle),
		sortStyleRanges,
	)(block);
	const consolidatedMatchingStyles = consolidateFirstTwoStyles({ matchingStyles });

	return R.pipe(
		R.prop('inlineStyleRanges'),
		R.filter(styleRange => styleRange.style != newStyle),
		R.concat(consolidatedMatchingStyles),
		sortStyleRanges,
		R.assoc('inlineStyleRanges', R.__, block)
	)(block);

}, blocks);
	
const findBlockByKey = ({ blocks, blockKey }) => R.find(block => block.key === blockKey, blocks);

const getMatchingStyleRanges = ({ blockKey, blocks, style }) => R.pipe(
	findBlockByKey,
	R.prop('inlineStyleRanges'),
	R.reduce(
		(accumulator, styleRange) => styleRange.style === style
			? { ...accumulator, matchingStyleRanges: R.append(styleRange, accumulator.matchingStyleRanges) }
			: { ...accumulator, nonMatchingStyleRanges: R.append(styleRange, accumulator.nonMatchingStyleRanges) },
		{ matchingStyleRanges: [], nonMatchingStyleRanges: [] } // initial value
	)
)({ blocks, blockKey });

const replaceBlocks = R.curry((originalBlocks, newBlocks) => {
	console.log('richTextStyleRangeHelpers--replaceblocks started with originalBlocks', originalBlocks, 'newBlocks', newBlocks);
	const returnVal = R.map(
	originalBlock => {
		console.log('richTextStyleRangeHelpers--replaceBlocks got originalBlock', originalBlock, 'newBlocks', newBlocks);
		const foundBlockByKey = findBlockByKey({ blocks: newBlocks, blockKey: originalBlock.key });
		console.log('richTextStyleRangeHelpers--replaceBlocks will return foundBlockByKey', foundBlockByKey, 'or the originalBlock', originalBlock);
		return foundBlockByKey || originalBlock;
		// return findBlockByKey({ blocks: newBlocks, blockKey: originalBlock.key }) || originalBlock // TIDY: reinstate this line instead of all the above lines
	}, 
	originalBlocks // TIDY
);
console.log('richTextStyleRangeHelpers--replaceBlocks will return', returnVal);
return returnVal; // TIDY
}
);

const replaceUpdatedBlock = R.curry((blocks, updatedBlock) => R.pipe(
	() => R.append(updatedBlock, []),
	replaceBlocks(blocks)
)());

const getLengthFromBlock = block => R.pipe(R.prop('text'), R.length)(block);

const addStyleRangeToBlock = R.curry((styleRange, block) => R.pipe(
	R.prop('inlineStyleRanges') || [],
	R.append(styleRange),
	sortStyleRanges,
	R.assoc('inlineStyleRanges', R.__, block),
)(block));

const toggleStyleOn = ({ style, start, middle, end, blocks }) => {
	if (start.blockKey === end.blockKey) {
		// just one block contains the range, so just update that block
		return R.pipe(
			findBlockByKey,
			addStyleRangeToBlock({
				offset: start.cursorPosition,
				length: end.cursorPosition - start.cursorPosition,
				style,
			}),
			replaceUpdatedBlock(blocks)
		)({ blocks, blockKey: start.blockKey });
	}
	// otherwise add style across all the blocks in the selection
	const blocksWithStartUpdated = R.pipe(
		findBlockByKey,
		block => R.pipe(
			getLengthFromBlock,
			R.subtract(R.__, start.cursorPosition),
			length => addStyleRangeToBlock({ offset: start.cursorPosition, length, style }, block)
		)(block),
		replaceUpdatedBlock(blocks)
	)({ blocks, blockKey: start.blockKey });

	const updatedMiddleBlocks = R.map(
		middleItem => R.pipe(
			findBlockByKey,
			block => R.pipe(
				getLengthFromBlock,
				length => addStyleRangeToBlock({ offset: 0, length, style }, block)
			)(block),
		)({ blocks: blocksWithStartUpdated, blockKey: middleItem.blockKey }),
	)(middle);
	const blocksWithMiddleUpdated = replaceBlocks(blocksWithStartUpdated, updatedMiddleBlocks);

	return R.pipe(
		findBlockByKey,
		addStyleRangeToBlock({ offset: 0, length: end.cursorPosition, style }),
		replaceUpdatedBlock(blocksWithMiddleUpdated)
	)({ blocks: blocksWithMiddleUpdated, blockKey: end.blockKey });
}

const incorporateNewStyles = ({ blocks, blockKey, newStyles, unchangedStyles }) => R.pipe(
	findBlockByKey,
	block => R.pipe(
		R.concat,
		R.tap(data => console.log('richTextStyleRangeHelpers--incorporateNewStyles concatenated new and unchanged styles to get', data)),
		sortStyleRanges,
		R.assoc('inlineStyleRanges', R.__, block),
		R.tap(data => console.log('richTextStyleRangeHelpers--incorporateNewStyles put styles into block', data)),
	)(newStyles, unchangedStyles),
	R.append(R.__, []), // put the updated block in an array as that's the form replaceBlocks wants
	R.tap(data => console.log('richTextStyleRangeHelpers--incorporateNewStyles about to call replaceBlocks with original blocks', blocks, 'and new blocks', data)),
	replaceBlocks(blocks),
)({ blocks, blockKey });

const toggleStyleOff = ({ style, start, middle, end, blocks }) => {
	// get the matching styles in the start block
	const { matchingStyleRanges: matchingStartStyles, nonMatchingStyleRanges: nonMatchingStartStyles } =
      getMatchingStyleRanges({ blockKey: start.blockKey, blocks, style });
	console.log(
      'richTextStyleRangeHelpers--toggleStyleOff got matchingStartStyles', matchingStartStyles,
      'nonMatchingStartStyles', nonMatchingStartStyles,
      'blocks', blocks
   );
					
	if (start.blockKey === end.blockKey) {
		const newStyles = R.reduce(
			(accumulator, matchingStyle) => {
				console.log('richTextStyleRangeHelpers--toggleStyleOff in reduce, got matchingStyle', matchingStyle, 'start', start, 'end', end);
				if (matchingStyle.offset < start.cursorPosition) {
					const shortenedStyleAdded = R.append({ ...matchingStyle, length: start.cursorPosition - matchingStyle.offset }, accumulator);
					console.log('richTextStyleRangeHelpers--toggleStyleOff case 1 or 2: shortened Style Added to new styleRanges:', shortenedStyleAdded);
					if (matchingStyle.offset + matchingStyle.length < end.cursorPosition) {
						// case 1: style starts before selection and ends in the middle of the selection, so shorten the matching style to end at the start cursor
						console.log('richTextStyleRangeHelpers--toggleStyleOff case 1: style starts before selection and ends in the middle of the selection');
						return shortenedStyleAdded;
					}
					// case 2: style starts before the selection and ends after the selection..so as well as the shortened style, add a new style from end.cursorPosition to matchingStyle END
					console.log('richTextStyleRangeHelpers--toggleStyleOff case 2: style starts before the selection and ends after the selection');
					return R.append(
						{ 
							...matchingStyle, 
							offset: end.cursorPosition, 
							length: matchingStyle.offset + matchingStyle.length - end.cursorPosition 
						}, 
						shortenedStyleAdded
					);
				}
				if (matchingStyle.offset >= start.cursorPosition) {
					if (matchingStyle.offset + matchingStyle.length < end.cursorPosition) {
						// case 3: matchingStyle is completely inside the selection.. so delete the matching style
						console.log('richTextStyleRangeHelpers--toggleStyleOff case 3: matchingStyle is completely inside the selection');
						return accumulator;
					}
					// case 4: matching style starts in the middle of the selection and ends after the selection .. so update the matchingStyle to start at the end.cursorPosition
					console.log('richTextStyleRangeHelpers--toggleStyleOff case 4: matchingStyle starts in the middle of the selection and ends after the selection');
					return R.append(
						{
							...matchingStyle,
							offset: end.cursorPosition,
							length: matchingStyle.offset + matchingStyle.length - end.cursorPosition
						},
						accumulator
					);
				}
				
			},
			[] //initial set of new styleRanges
		)(matchingStartStyles);
		console.log('richTextStyleRangeHelpers--toggleStyleOff got updatedStyles', newStyles);

		return incorporateNewStyles({ blocks, blockKey: start.blockKey, newStyles, unchangedStyles: nonMatchingStartStyles });
	}

	const newMatchingStartStyles = R.reduce(
		(accumulator, matchingStyle) => {
			if(matchingStyle.offset < start.cursorPosition) {
				console.log('richTextStyleRangeHelpers--toggleStyleOff start blcok case 1: matchingStyle starts before selection', matchingStyle);
				// case 1: matchingStyle starts before selection, so shorten the matching style to end at the start cursor
				return R.append({ ...matchingStyle, length: start.cursorPosition - matchingStyle.offset }, accumulator);
			}
			console.log('richTextStyleRangeHelpers--toggleStyleOff start block case 2: matchingStyle starts inside the selection', matchingStyle);
			// case 2: matchingStyle starts inside the selection, so remove the selection
			return accumulator;
		},
		[], // initial matching styles
		matchingStartStyles
	);

	const allBlocksWithStartUpdated = incorporateNewStyles({ blocks, blockKey: start.blockKey, newStyles: newMatchingStartStyles, unchangedStyles: nonMatchingStartStyles });
	console.log('richTextStyleRangeHelpers--toggleStyleOff got allBlocksWithStartUpdated', allBlocksWithStartUpdated);
	
	const newMiddleBlocks = R.map(
		middleData => {
			const middleBlock = findBlockByKey({ blocks, blockKey: middleData.blockKey });
			return R.pipe(
				R.prop('blockKey'),
				blockKey => getMatchingStyleRanges({ blockKey, blocks, style }),
				R.prop('nonMatchingStyleRanges'), // getMatchingStyleRanges returns {nonMatchingStyleRanges, matchingStyles} but only keep nonMatchingStyleRanges
				R.assoc('inlineStyleRanges', R.__, middleBlock)
			)(middleData);
		},
		middle
	);
	console.log('richTextStyleRangeHelpers--toggleStyleOff about to call replaceBlocks with original blocks allBlocksWithStartUpdated', allBlocksWithStartUpdated, 'newMiddleBlocks', newMiddleBlocks);
	const allBlocksWithMiddleUpdated = replaceBlocks(allBlocksWithStartUpdated, newMiddleBlocks);
	console.log('richTextStyleRangeHelpers--toggleStyleOff got allBlocksWithMiddleUpdated', allBlocksWithMiddleUpdated);

	const { matchingStyleRanges: matchingEndStyles, nonMatchingStyleRanges: nonMatchingEndStyles } = getMatchingStyleRanges({ blockKey: end.blockKey, blocks, style });
	console.log('richTextStyleRangeHelpers--toggleStyleOff got matchingEndStyles', matchingEndStyles, 'nonMatchingEndStyles', nonMatchingEndStyles);

	const newEndStyles = R.reduce(
		(accumulator, matchingStyle) => {
			if (matchingStyle.offset + matchingStyle.length < end.cursorPosition) {
				console.log('richTextStyleRangeHelpers--toggleStyleOff end styles case 1: the end of the matching style is before the end cursor', matchingStyle);
				// case 1: the end of the matching style is before the end cursor, so delete the matching style
				return accumulator;
			}
			console.log('richTextStyleRangeHelpers--toggleStyleOff end styles case 2: the end of the matching style is after the end cursor', 'matchingStyle', matchingStyle);
			// case 2: the end of the matching style is after the end cursor, so make the matching style's offset equal the end cursor
			return R.append({ 
				...matchingStyle, 
				offset: end.cursorPosition, 
				length: matchingStyle.length - (end.cursorPosition - matchingStyle.offset)
			}, accumulator);
		},
		[], // initial matching styles
		matchingEndStyles
	);
	console.log('richTextStyleRangeHelpers--toggleStyleOff got newEndStyles', newEndStyles, 'nonMatchingEndStyles', nonMatchingEndStyles);

	return incorporateNewStyles({ blocks: allBlocksWithMiddleUpdated, blockKey: end.blockKey, newStyles: newEndStyles, unchangedStyles: nonMatchingEndStyles });
}

const isStyleSetForFirstChar = ({ start, blocks, style }) => R.pipe(
	findBlockByKey,
	R.prop('inlineStyleRanges') || [],
	R.filter(styleRange => styleRange.offset <= start.cursorPosition && start.cursorPosition < styleRange.offset + styleRange.length),
	R.reduce(
		(accumulator, styleRange) => styleRange.style === style ? R.reduced(true) : accumulator,
		false // initial value
	)
)({ blocks, blockKey: start.blockKey });

const getCursorPositionInBlock = ({ cursorPosition, preceedingBlocksTextLength, block }) => 
	cursorPosition >= preceedingBlocksTextLength && cursorPosition < preceedingBlocksTextLength + block.text.length + BLOCK_END_CHAR_LENGTH
		? cursorPosition - preceedingBlocksTextLength
		: null;

const getBlocksForSelection = ({ cursorStart, cursorEnd, blocks }) => {
	const [ cursorRealStart, cursorRealEnd ] = cursorStart < cursorEnd ? [ cursorStart, cursorEnd ] : [ cursorEnd, cursorStart ]
	console.log('richTextStyleRangeHelpers--getBlocksForSelection got cursorRealStart', cursorRealStart, 'cursorRealEnd', cursorRealEnd);
	return R.reduce(
		(accumulator, block) => {
			const { totalTextLength, start } = accumulator;
			const cursorStartPosition = getCursorPositionInBlock({
				cursorPosition: cursorRealStart,
				preceedingBlocksTextLength: totalTextLength,
				block,
			});
			const cursorEndPosition = getCursorPositionInBlock({
				cursorPosition: cursorRealEnd,
				preceedingBlocksTextLength: totalTextLength,
				block,
			});
			console.log('richTextStyleRangeHelpers--getBlocksForSelection got totalTextLength', totalTextLength, 'block.text.length', block.text.length, 'cursorStartPosition', cursorStartPosition, 'cursorEndPosition', cursorEndPosition);
			if (isNothing(start.cursorPosition)) {
				if (isNothing(cursorStartPosition)) {
					//case 1: we're in a block before the start of the selection
					console.log('richTextStyleRangeHelpers--getBlocksForSelection case 1: in a block before the start of the selection', block);
					return { ...accumulator, totalTextLength: totalTextLength + block.text.length + BLOCK_END_CHAR_LENGTH, }
				}
				
				if (isNothing(cursorEndPosition)) {
					// case 2: we're in the starting block
					console.log('richTextStyleRangeHelpers--getBlocksForSelection case 2: in the starting block', block);
					return {
						...accumulator,
						start: { cursorPosition: cursorStartPosition, blockKey: block.key },
						totalTextLength: totalTextLength + block.text.length + BLOCK_END_CHAR_LENGTH,
					}
				}
				// case 2a: the starting and ending block are both this block
				console.log('richTextStyleRangeHelpers--getBlocksForSelection case 2a: the starting and ending block are both this block', block);
				return R.reduced({
					...accumulator,
					start: { cursorPosition: cursorStartPosition, blockKey: block.key },
					end: { cursorPosition: cursorEndPosition, blockKey: block.key }
				});
			}

			if (isNothing(cursorStartPosition) && isNothing(cursorEndPosition)) {
				// case 3: we're in a middle block
				console.log('richTextStyleRangeHelpers--getBlocksForSelection case 3: in a middle block', block, 'accumulator', accumulator);
				return {
					...accumulator,
					middle: R.append({ blockKey: block.key }, accumulator.middle),
					totalTextLength: totalTextLength + block.text.length + BLOCK_END_CHAR_LENGTH,
				}
			}

			// case 4: we're in the end block
			console.log('richTextStyleRangeHelpers--getBlocksForSelection case 4: in the end block', block, 'accumulator', accumulator);
			return R.reduced({
				...accumulator,
				end: { cursorPosition: cursorEndPosition, blockKey: block.key }
			})
		},
		{
			totalTextLength: 0,
			start: { cursorPosition: null, blockKey: null },
			middle: [],
			end: { cursorPosition: null, blockKey: null, }
		}, // initial value
		blocks
	);
}

export const updateStyles = ({ newStyle, cursorStart, cursorEnd, blocks }) => {
	// Note: we assume blocks are in order as correct display (before getting to this function) depends on that
	const { start, middle, end } = getBlocksForSelection({ cursorStart, cursorEnd, blocks });
	console.log('reichTextHelpers--updateStyles got start', start, 'middle', middle, 'end', end);

	// decide whether we are toggling style on or off based on the first char in the first block
	const isTogglingStyleOff = isStyleSetForFirstChar({ start, blocks, style: newStyle });

	if (isTogglingStyleOff) {
		return consolidateStyleRanges({ 
			blocks: toggleStyleOff({ style: newStyle, start, middle, end, blocks }), 
			newStyle 
		});
		// blocksWithUpdatedStyles = toggleStyleOff({ style: newStyle, start, middle, end, blocks }); // TIDY
	}
	// blocksWithUpdatedStyles = toggleStyleOn({ style: newStyle, start, middle, end, blocks }); // TIDY
	return consolidateStyleRanges({ 
		blocks: toggleStyleOn({ style: newStyle, start, middle, end, blocks }), 
		newStyle 
	});
}