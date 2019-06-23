import {GenericContextFactory} from './GenericContextFactory.js';
import React, {useState} from 'react'

const {
    Context: FocusedRequestContext,
    withContext: withFocusedRequestContext
} = GenericContextFactory(null)

function FocusedRequestStore({children}) {
    const [focusedRequestId, setFocusedRequestId] = useState(null);
    console.log({focusedRequestId})
    const value = {
        focusedRequestId,
        setFocusedRequestId(id) {
            if (id !== focusedRequestId) {
                setFocusedRequestId(id)
            }
        }
    }

    return (
        <FocusedRequestContext.Provider value={value}>
            {children}
        </FocusedRequestContext.Provider>
    )
}

export {
    FocusedRequestContext,
    FocusedRequestStore,
    withFocusedRequestContext
}