import React from 'react';
import { useSelector } from 'react-redux';
import { clearedAllErrorMessages } from '../../actions';
import { stateErrorMessages } from '../../helpers/dataStructureHelpers';
import CloseIcon from '../atoms/IconClose';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT } from '../../constants';

const GlobalErrorModal = () => {
    const errors = useSelector(state => stateErrorMessages(state));
    return (
        <div className="fixed z-50 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
            <div className="flex justify-between items-center">
					<ul>{errors}</ul>
					<CloseIcon onClickFn={clearedAllErrorMessages} width={TOOL_ICON_WIDTH} height={TOOL_ICON_HEIGHT} />
            </div>
        </div>
    );
}

export default GlobalErrorModal;