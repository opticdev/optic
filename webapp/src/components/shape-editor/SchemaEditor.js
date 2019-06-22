import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {withRfcContext} from '../../contexts/RfcContext.js';
import KeyTypeRow from './KeyTypeRow';
import TypeName from './TypeName';
import ExpandButton from './ExpandButton';
import {SchemaEditorContext} from '../../contexts/SchemaEditorContext';
import AddFieldButton from './AddFieldButton';
import DeleteButton from './DeleteButton';
import TypeMenu from './TypeMenu/TypeMenu';
import classNames from 'classnames'
import AddTypeButton from './AddTypeButton';
import TypeRefModal from './TypeMenu/TypeRefModal';
import {unwrap} from './Helpers';

const styles = theme => ({
    root: {
        maxWidth: '1000',
        width: '100%',
        backgroundColor: '#f8f8f8',
        padding: 11,
        paddingLeft: 10,
        paddingTop: 9,

    },
    row: {
        height: 31,
        '&:hover': {
            backgroundColor: 'rgba(78,165,255,0.08)'
        },
        '&:hover $deleteContainer': {
            display: 'inherit'
        }
    },
    activeRow: {
        borderBottom: '1px solid rgba(78,165,255,0.4)',
        backgroundColor: 'rgba(78,165,255,0.08)'
    },
    deleteContainer: {
        position: 'absolute',
        right: 11,
        display: 'none'
    }
});

const Row = withStyles(styles)(({classes, indent = 0, children, expandButton, addButton, addTypeButton, id, deleteType, depth}) => {

    return <SchemaEditorContext.Consumer>
        {({editorState, operations}) => {

            if (editorState.typeMenu.id === id) {
                let timer = null;
                return <ListItem className={classNames(classes.row, classes.activeRow)}
                                 dense={true}
                                 onMouseEnter={() => {
                                     if (timer !== null) {
                                         clearTimeout(timer)
                                     }
                                 }}
                                 onMouseLeave={() => {
                                     timer = setTimeout(() => {
                                         operations.hideTypeMenu(id)
                                     }, 400)
                                 }}
                                 style={{paddingLeft: indent * 13 + 10, height: 31}}>
                    <TypeMenu id={id}/>
                </ListItem>
            } else {
                return <ListItem className={classes.row}
                                 dense={true}
                                 style={{paddingLeft: indent * 13 + 10, height: 31}}>
                    {expandButton}
                    {children}
                    {addButton}
                    {addTypeButton}
                    {id && depth ?
                        <div className={classes.deleteContainer}><DeleteButton id={id} deleteType={deleteType}/>
                        </div> : null}
                </ListItem>
            }

        }}
    </SchemaEditorContext.Consumer>
});

class SchemaEditor extends React.Component {

    initialState = () => {

        const root = unwrap(this.props.currentShape.root)

        let collapsed = []

        if (root.type.hasFields) { //collapse nested objects by default
            collapsed = root.fields
                .filter(f => unwrap(f.shape).type.hasFields)
                .map(f => f.id)
        }

        return {
            collapsed,
            refModalTarget: null,
            typeMenu: {
                anchor: null,
                id: null,
                currentType: null
            }
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.conceptId !== this.props.conceptId) {
            this.setState(this.initialState())
        }
    }

    constructor(props) {
        super(props);
        this.state = this.initialState()
    }

    toggleCollapsed = (id, forceOpen) => () => {
        if (this.state.collapsed.includes(id) || forceOpen) {
            this.setState({collapsed: this.state.collapsed.filter(i => i !== id)});
        } else {
            this.setState({collapsed: [...this.state.collapsed, id]});
        }
    };

    runCommand = (command) => {
        this.props.handleCommand(command)
    };

    showTypeMenu = (id, currentType) => (event) => {
        this.setState({
            typeMenu: {
                id, currentType
            }
        });
    };

    hideTypeMenu = (id) => {
        if (id) {
            if (this.state.typeMenu.id === id) {
                this.setState({
                    typeMenu: {
                        id: null, currentType: null
                    }
                });
            }
        } else {
            this.setState({
                typeMenu: {
                    id: null, currentType: null
                }
            });
        }
    };

    showRefModal = (id) => () => {
        this.setState({
            refModalTarget: id
        });
    };

    hideRefModal = () => {
        this.setState({
            refModalTarget: null
        });
    };

    render() {
        const {classes} = this.props;

        const {root} = this.props.currentShape;

        const context = {
            operations: {
                toggleCollapsed: this.toggleCollapsed,
                runCommand: this.runCommand,
                showTypeMenu: this.showTypeMenu,
                hideTypeMenu: this.hideTypeMenu,
                showRefModal: this.showRefModal,
                hideRefModal: this.hideRefModal
            },
            currentShape: this.props.currentShape,
            allowedReferences: this.props.allowedReferences,
            editorState: this.state,
            mode: this.props.mode,
            conceptId: this.props.conceptId
        };

        const tree = flattenTree(root, [], this.state.collapsed);

        return (
            <SchemaEditorContext.Provider value={context}>
                <List className={classes.root} key={this.props.conceptId}>
                    {tree}
                </List>
                <TypeRefModal targetId={this.state.refModalTarget} conceptId={this.props.conceptId}/>
            </SchemaEditorContext.Provider>
        );
    }
}

function flattenTree(_node, array = [], collapsed = []) {

    const node = (_node.isUnwrapped) ? _node : unwrap(_node)

    const buildNext = (node) => flattenTree(node, array, collapsed);

    if (node.isObjectFieldList) {
        const objectRow = (
            <Row indent={node.depth}
                 key={node.id}
                 id={node.id}
                 depth={node.depth}
                 expandButton={<ExpandButton parentId={node.id}/>}
                 addButton={<AddFieldButton parentId={node.id}/>}
            >
                <TypeName node={node} style={{marginLeft: 12}} id={node.id}/>
            </Row>
        );

        if (node.depth === 0) {
            array.push(objectRow);
        }

        if (!collapsed.includes(node.id)) {
            node.fields.forEach(i => buildNext(i, array));
        }

    } else if (node.isField) {
        array.push(
            <Row indent={node.depth}
                 id={node.shape.id}
                 deleteType={'field'}
                 key={node.id}
                 depth={node.depth}
                 addButton={node.shape.type.hasFields ? <AddFieldButton parentId={node.shape.id}/> : null}
                 addTypeButton={node.shape.type.hasTypeParameters ?
                     <AddTypeButton parentId={node.shape.id}/> : null}
                 expandButton={node.shape.type.hasFields || node.shape.type.hasTypeParameters ?
                     <ExpandButton parentId={node.shape.id}/> : null}>
                <KeyTypeRow
                    initialKey={node.key}
                    id={node.id}
                    node={node.shape}
                    type={node.shape.type}/>
            </Row>
        );
        buildNext(node.shape, array);

    } else if (node.isTypeParametersList) {
        const typeParameterRow = (
            <Row indent={node.depth}
                 key={node.id}
                 id={node.id}
                 depth={node.depth}
                 addTypeButton={<AddTypeButton parentId={node.id}/>}
                 expandButton={<ExpandButton parentId={node.id}/>}
            >
                <TypeName node={node} style={{marginLeft: 12}} id={node.id}/>
            </Row>
        );

        if (node.depth === 0) {
            array.push(typeParameterRow);
        }

        if (!collapsed.includes(node.id)) {
            node.typeParameters.forEach(i => buildNext(i, array));
        }

    } else if (node.isTypeParameter) {
        array.push(
            <Row indent={node.depth}
                 key={node.shape.id}
                 deleteType={'type-parameter'}
                 id={node.shape.id}
                 depth={node.depth}
                 addButton={node.shape.type.hasFields ? <AddFieldButton parentId={node.shape.id}/> : null}
                 addTypeButton={node.shape.type.hasTypeParameters ? <AddTypeButton parentId={node.shape.id}/> : null}
                 expandButton={node.shape.type.hasFields || node.shape.type.hasTypeParameters ?
                     <ExpandButton parentId={node.shape.id}/> : null}>
                <TypeName node={node.shape} style={{marginLeft: 12}} id={node.shape.id}/>
            </Row>
        )
        buildNext(node.shape, array);
    } else if (node.depth === 0 && node.isLeaf) {
        array.push(<Row indent={node.depth}
                        key={node.id}
                        id={node.id}
                        depth={node.depth}
        >
            <TypeName node={node} style={{marginLeft: 12}} id={node.id}/>
        </Row>)
    }

    return array;
}

export default withRfcContext(withStyles(styles)(SchemaEditor));
