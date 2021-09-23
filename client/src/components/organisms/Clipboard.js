import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { stateClipboardText } from '../../helpers/dataStructureHelpers';
import { isNothing } from '../../helpers';
import { log } from '../../clientLogger';
import { LOG } from '../../constants';

const Clipboard = () => {
    const clipboardValue = useSelector(state => stateClipboardText(state));
    const [clipboardError, setClipboardError] = useState('');
    if (isNothing(clipboardValue)) {
        return null;
    }
    
    // this does not work for firefox, but it does work for Chrome & Edge
    // could potentially do something where cells aren't copied to the clipboard, but they are in the range store object
    // so could still be pasted within the app
    navigator.permissions.query({name: "clipboard-write"})
    .then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
            navigator.clipboard.writeText(clipboardValue)
            .then(
                () => {
                    // clipboard successfully set 
                    log({ level: LOG.INFO }, 'Clipboard successfully updated with value', clipboardValue);
                },
                () => {
                    // clipboard write failed 
                    log({ level: LOG.ERROR }, 'Clipboard write failed');
                    setClipboardError('No sheet copied to the clipboard, sorry!');
                }
            )
            .catch(err => {
                log({ level: LOG.DEBUG }, 'Clipboard write failed', err);
                setClipboardError('No sheet copied to the clipboard, sorry!');
            });
        } else {
            log({ level: LOG.DEBUG }, 'Clipboard write failed as result.state was', result.state);
            setClipboardError('No sheet copied to the clipboard, sorry!');
        }
    })
    .catch(err => {
        log({ level: LOG.DEBUG }, 'Clipboard write failed. Might be browser iseue. Error was:', err);
        setClipboardError('This browser doesn\'t like copying your sheet to the clipboard, sorry! Perhaps try another browser');
    });

    return <div className="text-vibrant-burnt-orange text-xs italic">{clipboardError}</div>
}

export default Clipboard;