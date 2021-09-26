import React from 'react';
import managedStore from '../../store';
import CloseIcon from '../atoms/IconClose';
import { updatedInfoModalVisibility } from '../../actions/infoModalActions';
import { stateGlobalInfoModalContent, stateGlobalInfoModalIsVisible } from '../../helpers/dataStructureHelpers';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT } from '../../constants';

const GlobaInfoModal = () => stateGlobalInfoModalIsVisible(managedStore.state)
    ? <div className="fixed z-50 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
        <div className="flex justify-end">
            <CloseIcon onClickFn={() => updatedInfoModalVisibility(false)} width={TOOL_ICON_WIDTH} height={TOOL_ICON_HEIGHT} />
        </div>
        <div>{stateGlobalInfoModalContent(managedStore.state)}</div>
    </div>
    : null;

export default GlobaInfoModal;