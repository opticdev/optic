import React from 'react';
import {prefixes} from '../components/requests/NewRequestStepper.js';
import {GenericContextFactory} from './GenericContextFactory.js';

const {
    Context: ExpansionContext,
    withContext: withExpansionContext
} = GenericContextFactory(null)

class ExpansionStore extends React.Component {
    state = {
        collapsedTrails: new Set()
    }
    expandTrail = (trail) => {
        this.state.collapsedTrails.delete(JSON.stringify(trail))
        this.forceUpdate()
    }
    collapseTrail = (trail) => {
        this.state.collapsedTrails.add(JSON.stringify(trail))
        this.forceUpdate()
    }

    isTrailCollapsed = (trail) => {
        return this.state.collapsedTrails.has(JSON.stringify(trail))
    }

    isTrailParentCollapsed = (trail) => {
        return prefixes(trail)
            .slice(0, -1)
            .some(prefix => {
            return this.state.collapsedTrails.has(JSON.stringify(prefix))
        })
    }

    render() {
        const context = {
            collapsedTrails: this.state.collapsedTrails,
            expandTrail: this.expandTrail,
            collapseTrail: this.collapseTrail,
            isTrailCollapsed: this.isTrailCollapsed,
            isTrailParentCollapsed: this.isTrailParentCollapsed,
        }
        return (
            <ExpansionContext.Provider value={context}>
                {this.props.children}
            </ExpansionContext.Provider>
        )
    }
}

export {
    ExpansionStore,
    withExpansionContext
}