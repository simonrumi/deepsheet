import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { stateClipboard } from '../../helpers/dataStructureHelpers';
import { isNothing } from '../../helpers';

const Clipboard = () => {
    const clipboardValue = useSelector(state => stateClipboard(state));
    const [clipboardError, setClipboardError] = useState('');
    if (isNothing(clipboardValue)) {
        return null;
    }
    
    // this does not work for firefox, but it does work for Chrome & Edge
    // could potentially do something where cells aren't copied to the clipboard, but they are in the range store object
    // so could still be pasted within the app
    navigator.permissions.query({name: "clipboard-write"})
    .then(result => {
        console.log('Clipboard queried clipboard-write and got result', result);
        if (result.state === 'granted' || result.state === 'prompt') {
            navigator.clipboard.writeText(clipboardValue)
            .then(
                () => {
                    // clipboard successfully set 
                    console.log('Clipboard successfully updated');
                    // setIsPopulated(true);
                },
                () => {
                    // clipboard write failed 
                    console.log('Clipboard write failed');
                    setClipboardError('No sheet copied to the clipboard, sorry!');
                }
            )
            .catch(err => {
                setClipboardError('No sheet copied to the clipboard, sorry!');
            });
        } else {
            setClipboardError('No sheet copied to the clipboard, sorry!');
        }
    })
    .catch(err => {
        setClipboardError('This browser doesn\'t like copying your sheet to the clipboard, sorry! Perhaps try another browser');
    });

    console.log('about to render clipboard with clipboardValue', clipboardValue);
    return <div className="text-vibrant-burnt-orange text-xs italic">{clipboardError}</div>
}

export default Clipboard;