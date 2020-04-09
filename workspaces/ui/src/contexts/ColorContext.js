import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';

export const ColorTags = {
  ADDED: 'added',
  CHANGED: 'changed',
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
export const AddedGreenBackground = 'rgba(15,129,105,0.2)'

export const ChangedYellow = '#c8b768'
export const ChangedYellowBackground = 'rgba(200,183,104,0.1)'

export const RemovedRed = '#c86363'
export const RemovedRedBackground = 'rgba(193,4,9,0.1)'

export { UpdatedBlue, UpdatedBlueBackground } from '../theme'

export const ChangedYellowBright = '#f2dd7e'

export const AddedStyle = (paddingLeft = 15, paddingTop = 9, paddingBottom = 9) => ({
  borderLeft: `3px solid ${AddedGreen}`,
  backgroundColor: AddedGreenBackground,
  paddingLeft,
  paddingTop,
  paddingBottom
})

export const ChangedStyle = (paddingLeft = 15, paddingTop = 9, paddingBottom = 9) => ({
  borderLeft: `3px solid ${ChangedYellow}`,
  backgroundColor: ChangedYellowBackground,
  paddingLeft,
  paddingTop,
  paddingBottom
})
