import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {routerUrls} from '../../routes.js';
import {primitiveColors} from './Types';
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import BasicButton from './BasicButton';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {Link} from 'react-router-dom';
import {unwrap} from './Helpers';

const styles = theme => ({
    root: {
        display: 'flex'
    },
    typeChangeButton: {
        fontSize: 13,
        fontWeight: 400,
        marginTop: -2,
    },
    goTo: {
        marginLeft: 10,
        cursor: 'pointer',
        color: '#3682e3'
    }
});

class TypeName extends React.Component {

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.id !== nextProps.id) {
            this.setState({
                fieldName: nextProps.initialKey || ''
            });
        }
    }

    render() {

        const {classes, node, inField, style, id, baseUrl} = this.props;
        const {type} = node;

        if (inField && type.hasFields) {
            return null;
        }

        const color = (() => {

            if (type.isRef) {
                return '#8a558e';
            } else {
                return primitiveColors[type.id] || '#49525f';
            }

        })();

        return <SchemaEditorContext.Consumer>
            {({currentShape, allowedReferences, operations, mode}) => {
                return (
                    <div className={classes.root} key={id}>
                        <BasicButton
                            className={classes.typeChangeButton}
                            disableRipple={true}
                            disabled={!(mode === EditorModes.DESIGN)}
                            onClick={operations.showTypeMenu(id, type)}
                            style={{
                                color,
                                display: 'flex',
                                fontWeight: (type.hasFields || type.hasTypeParameters) ? 700 : 200,
                                ...style,
                            }}>


                            {type.isRef ? (
                                <Link to={routerUrls.conceptPage(baseUrl,type.conceptId)} style={{textDecoration: 'none'}}>
                                    <div
                                        className={classes.goTo}
                                        style={{pointerEvents: 'none'}}
                                    >(view)
                                    </div>
                                </Link>
                            ) : null}
                        </BasicButton>
                    </div>
                );
            }}
        </SchemaEditorContext.Consumer>;
    }
}

export default withEditorContext(withStyles(styles)(TypeName));

export const DisplayRootTypeName = withStyles(styles)(({shape, classes, style}) => {

    const {type} = unwrap(shape);

    const color = (() => {

        if (type.isRef) {
            return '#8a558e';
        } else {
            return primitiveColors[type.id] || '#49525f';
        }

    })();

    return (
        <div className={classes.root}>
            <BasicButton
                className={classes.typeChangeButton}
                disabled={true}
                style={{
                    color,
                    fontWeight: (type.hasFields || type.hasTypeParameters) ? 700 : 200,
                    ...style,
                }}>

                {type.isRef ? <div
                    className={classes.goTo}
                >(view)</div> : null}
            </BasicButton>
        </div>
    );
});
