import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Modal from '@material-ui/core/Modal';
import {DialogContent, DialogTitle, Typography} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import {withShapeDialogContext} from '../../contexts/ShapeDialogContext';
import {RfcContext} from '../../contexts/RfcContext';
import {EditorModes, EditorStore} from '../../contexts/EditorContext';
import ShapeViewer from './ShapeViewer';
import {routerUrls} from '../../routes';
import {ExpansionStore} from '../../contexts/ExpansionContext';
import {ShapeEditorStore} from '../../contexts/ShapeEditorContext';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ContributionTextField from '../contributions/ContributionTextField';
import {ShapesCommands} from '../../engine';
import {updateContribution} from '../../engine/routines';
import {ExampleToolTip} from '../diff/DiffCard';

const styles = theme => ({
  shapeEditorContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
    width: '96%',
  }
});

class ShapeViewerStack extends React.Component {
  render() {
    const {open, close, shapeId, pushToStack, back, hasPrevious, examples} = this.props.shapeDialog;
    const {classes, handleCommands} = this.props;

    const example = examples.find(i => i.shapeId === shapeId);

    return (
      <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle style={{paddingBottom: 0}}>
          <div style={{marginBottom: 8, display: 'flex', flexDirection: 'row'}}>
            <Button color="secondary" onClick={back} disabled={!hasPrevious} size={'small'}>Back</Button>
            <Button color="primary" onClick={close} size={'small'}>Close</Button>
            <div style={{flex: 1, textAlign: 'center'}}>
              <Typography variant="overline" style={{fontSize: 13, color: '#828282', marginLeft: -77}}>Shape
                Inspector</Typography>
            </div>
          </div>
          <Divider/>
        </DialogTitle>
        {shapeId && <DialogContent>
          <RfcContext.Consumer>
            {(rfcContext) => {
              const shape = rfcContext.queries.shapeById(shapeId);
              return (<div>

                <div style={{display: 'flex', flexDirection: 'row'}}>
                  <ContributionTextField
                    key={`${shapeId}-name`}
                    value={shape.name}
                    style={{width: 300}}
                    fullWidth={true}
                    variant={'headline'}
                    placeholder={'Name this Concept'}
                    mode={EditorModes.DESIGN}
                    onBlur={(value) => {
                      const command = ShapesCommands.RenameShape(shapeId, value);
                      handleCommands([command]);
                      close();
                    }}
                  />

                  <div style={{flex: 1}} />

                  {example && (
                    <ExampleToolTip example={example.example}>
                      <Typography variant="overline"
                                  color="primary"
                                  style={{marginTop: 10, marginRight: 38, cursor: 'pointer'}}>
                        See Example</Typography>
                    </ExampleToolTip>
                  )}

                </div>


                <ShapeEditorStore onShapeSelected={(shapeId) => {
                  pushToStack(shapeId);
                }}>
                  <ExpansionStore>
                    <div className={classes.shapeEditorContainer}>
                      <ShapeViewer shape={shape}/>
                    </div>
                  </ExpansionStore>
                </ShapeEditorStore>

              </div>);
            }}
          </RfcContext.Consumer>
        </DialogContent>}
      </Dialog>
    );
  }
}

export default withShapeDialogContext(withStyles(styles)(ShapeViewerStack));
