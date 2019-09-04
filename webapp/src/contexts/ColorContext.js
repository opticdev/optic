import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';

const ColorTags = {
  ADDED: 'added',
}

const {
    Context: ColoredIdsContext,
    withContext: withColoredIdsContext
} = GenericContextFactory(null)

class ColoredIdsStore extends React.Component {
    render() {
        const context = {
            coloredIds: this.props.ids || [],
            coloredTag: this.props.tag || ColorTags.ADDED
        }
        return (
            <ColoredIdsContext.Provider value={context}>
                {this.props.children}
            </ColoredIdsContext.Provider>
        )
    }
}

export {
  ColoredIdsStore,
  withColoredIdsContext
}

//Shared Styles

export const AddedGreen = '#17c8a3'
export const AddedGreenBackground = 'rgba(23,200,163,0.1)'


export const AddedStyle = (paddingLeft = 15, paddingTop = 9, paddingBottom = 9) => ({
  borderLeft: `3px solid ${AddedGreen}`,
  backgroundColor: AddedGreenBackground,
  paddingLeft,
  paddingTop,
  paddingBottom
})
