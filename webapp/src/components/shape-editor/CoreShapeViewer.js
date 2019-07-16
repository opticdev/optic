import React from 'react';
import PropTypes from 'prop-types';
import {withRfcContext} from '../../contexts/RfcContext.js';

class CoreShapeViewer extends React.Component {
    render() {
        const {queries, coreShapeId} = this.props;
        const shape = queries.shapeById(coreShapeId);
        const {name} = shape;

        return (
            <div>
                {name}
            </div>
        );
    }
}

CoreShapeViewer.propTypes = {};

export default withRfcContext(CoreShapeViewer);