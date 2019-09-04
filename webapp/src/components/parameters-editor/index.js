import * as PropTypes from 'prop-types';
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from 'react-router-dom';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {ExpansionStore} from '../../contexts/ExpansionContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {ShapeEditorStore} from '../../contexts/ShapeEditorContext.js';
import {routerUrls} from '../../routes.js';
import {primary} from '../../theme';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import classNames from 'classnames';
import ShapeViewer from '../shape-editor/ShapeViewer.js';
import {getName} from '../utilities/PathUtilities.js';
import ParameterNameInput from './ParameterNameInput';
import ContributionWrapper from '../contributions/ContributionWrapper';
import {EditorModes} from '../../contexts/EditorContext';
import Divider from '@material-ui/core/Divider';


const styles = theme => ({
  root: {},
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {},

  tableTitle: {
    padding: 10,
    paddingBottom: 15,
    color: primary
  },
  nameCol: {
    width: 100,
    overflow: 'hidden'
  },
  required: {
    fontSize: 11,
    color: '#122739'
  },
  cell: {
    border: 'none',
    flexDirection: 'row',
    display: 'column'
  },
  expandContent: {
    margin: 0,
    fontWeight: 200
  },
  singleLine: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: 500,
    fontWeight: 200
  },
  multiLine: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: 642,
    fontWeight: 200
  },
  nameCell: {
    paddingLeft: 0,
    marginLeft: -10
  },
  detailRoot: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 200
  },
  expandedSummary: {
    marginBottom: -20
  },
  focusedSummary: {
    backgroundColor: 'white !important'
  },
  rootOverride: {
    '&:before': {
      backgroundColor: 'transparent !important'
    },
    // '&:hover': {
    //     borderLeft: '1px solid red'
    // }
  },
  shapeEditorContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f8f8f8'
  },
  previewShape: {
    fontSize: 12,
  }
});

export function pathParametersToRows(pathParameters, contributions) {
  return pathParameters.map((pathParameter) => {
    const shapeDescriptor = getRequestParameterShapeDescriptor(pathParameter.descriptor.ParameterizedPathComponentDescriptor.requestParameterDescriptor);
    return {
      id: pathParameter.pathId,
      name: getName(pathParameter),
      description: contributions.getOrUndefined(pathParameter.pathId, 'description'),
      shapeId: shapeDescriptor.shapeId,
      isRemoved: shapeDescriptor.isRemoved
    };
  });
}

export function getRequestParameterShapeDescriptor(descriptor) {
  if (descriptor && descriptor.ShapedRequestParameterShapeDescriptor) {
    return descriptor.ShapedRequestParameterShapeDescriptor;
  }
  return {};
}

export function requestParametersToRows(parameters, contributions) {
  return parameters.map((parameter) => {
    const shapeDescriptor = getRequestParameterShapeDescriptor(parameter.requestParameterDescriptor.shapeDescriptor);
    return {
      id: parameter.parameterId,
      name: parameter.requestParameterDescriptor.name,
      description: contributions.getOrUndefined(parameter.parameterId, 'description'),
      shapeId: shapeDescriptor.shapeId,
      isRemoved: shapeDescriptor.isRemoved
    };
  });
}

class ParametersEditor extends React.Component {

  state = {
    expandedParameterIds: []
  };

  handleRename = (id) => (name) => {
    this.props.onRename({id, name});
  };

  updateExpandedParameterIds = (id) => (e, opened) => {
    const inArray = this.state.expandedParameterIds.includes(id);
    if (inArray && !opened) {
      this.setState({expandedParameterIds: this.state.expandedParameterIds.filter(i => i !== id)});
    } else if (!inArray && opened) {
      this.setState({expandedParameterIds: [...this.state.expandedParameterIds, id]});
    }
  };

  render() {
    const {classes} = this.props;
    const {history} = this.props;
    const {baseUrl, mode} = this.props;
    const {title, parameters, cachedQueryResults, queries} = this.props;
    const {contributions} = cachedQueryResults;
    const allRows = this.props.rowMapper(parameters, contributions);
    const rows = mode === EditorModes.DESIGN ? allRows : allRows.filter((row) => {
      return !!row.name;
    });

    if (mode === EditorModes.DOCUMENTATION && rows.length === 0) {
      return null;
    }

    return (
      <div className={classes.root}>
        <Typography variant="h5" className={classes.tableTitle}>{title}</Typography>

        {rows
          .map(row => {
            const isExpanded = this.state.expandedParameterIds.includes(row.id);
            let typeCell = null;
            let schemaEditor = null;
            if (row.shapeId) {
              const shape = queries.shapeById(row.shapeId);

              const shapeName = shape.name || queries.shapeById(shape.baseShapeId).name;
              typeCell = (
                <TableCell
                  className={classes.cell}
                  style={{width: (isExpanded) ? 642 : 'inherit'}}>
                  <div style={{flexDirection: 'row', display: 'flex'}}>
                    <div
                      style={{marginLeft: 12, flex: 1}}
                      className={(isExpanded) ? classes.multiline : classes.singleLine}>
                      {(mode === EditorModes.DOCUMENTATION || !isExpanded) ? <><i>({shapeName})</i> <span
                        style={{marginLeft: 12}}>{row.description}</span></> : (
                        <ContributionWrapper
                          style={{marginTop: -20}}
                          onClick={(e) => e.stopPropagation()}
                          contributionParentId={row.id}
                          contributionKey={'description'}
                          variant={'multi'}
                          placeholder={`Description`}
                        />
                      )}
                    </div>
                  </div>
                </TableCell>
              );

              schemaEditor = (
                <ShapeEditorStore onShapeSelected={(shapeId) => {
                  debugger
                  history.push(routerUrls.conceptPage(baseUrl, shapeId));
                }}>
                  <ExpansionStore>
                    <div className={classes.shapeEditorContainer}>
                      <ShapeViewer shape={shape}/>
                    </div>
                  </ExpansionStore>
                </ShapeEditorStore>
              );
            }


            return (
              <>
                <ExpansionPanel
                  onChange={this.updateExpandedParameterIds(row.id)}
                  square={true}
                  classes={{root: classes.rootOverride}}
                  elevation={0}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon/>}
                    classes={{
                      content: classes.expandContent,
                      expanded: classes.expandedSummary,
                      focused: classes.focusedSummary
                    }}
                    style={{width: '100%'}}
                  >
                    <Table>
                      <TableBody>
                        <TableRow key={row.name}>
                          <TableCell
                            component="th" scope="row"
                            className={classNames(classes.cell, classes.nameCell)}>
                            <div className={classes.nameCol}>
                              <ParameterNameInput
                                defaultName={row.name}
                                mode={mode}
                                onBlur={this.handleRename(row.id)}
                              />
                              {row.required ? <> <br/><i
                                className={classes.required}>required</i> </> : null}
                            </div>
                          </TableCell>
                          {typeCell}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails classes={{root: classes.detailRoot}}>
                    <Typography variant="overline" style={{
                      marginTop: 2,
                      paddingRight: 8,
                      color: primary
                    }}>Shape</Typography>
                    {schemaEditor}
                    <Divider style={{marginTop: 22}}/>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </>
            );
          })}
      </div>
    );
  }
}

ParametersEditor.propTypes = {
  title: PropTypes.string.isRequired,
  parameters: PropTypes.array.isRequired,
  onRename: PropTypes.func.isRequired
};

export default withRouter(withEditorContext(withRfcContext(withStyles(styles)(ParametersEditor))));
