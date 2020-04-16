import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {withDiffContext} from './DiffContext';
import {DocSubGroup} from '../../docs/DocSubGroup';
import {DocDarkGrey, DocDivider} from '../../docs/DocConstants';
import {CompareEquality} from '@useoptic/domain';
import {IgnoreDiffContext} from './DiffPageNew';
import Button from '@material-ui/core/Button';
import {InterpretationRow} from './DiffViewer';
import VisibilityIcon from '@material-ui/icons/Visibility';
import TocIcon from '@material-ui/icons/Toc';
import {DiffToggleStates, withDiffToggleContext} from './DiffShapeViewer';

const drawerWidth = 310;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
  },
  emptyDiff: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%'
  },
  diffShow: {
    display: 'flex',
    flexDirection: 'column',
    padding: 12,
    paddingTop: 0,
  }
}));

function DiffDrawer({regions, selectedDiff, getInteractionsForDiff, getDiffDescription, currentExample, interpretationsForDiffAndInteraction, setSelectedDiff, selectedInterpretation, setSelectedInterpretation, acceptSuggestion, approvedKey, showTab, setTabTo}) {
  const classes = useStyles();

  return (
    <Paper
      className={classes.drawer}
    >

      {selectedDiff && (() => {
        const description = getDiffDescription(selectedDiff, currentExample);
        const interactions = getInteractionsForDiff(selectedDiff);

        const interpretations = interpretationsForDiffAndInteraction(selectedDiff, currentExample);

        const showShape = showTab === DiffToggleStates.EXAMPLE;

        const previewButton = !showShape ? (
          <Button size="small" color="primary" onClick={() => setTabTo(DiffToggleStates.EXAMPLE)}
                  startIcon={<VisibilityIcon style={{height: 20, width: 20}} color="primary"/>}>
            Show Example
          </Button>
        ) : (
          <Button size="small" color="primary" onClick={() => setTabTo(DiffToggleStates.SHAPE)}
                  startIcon={<TocIcon style={{height: 20, width: 20}} color="primary"/>}>
            Show Shape
          </Button>
        );

        // const button = showShape ? (
        //   <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
        //     <LightTooltip title="Show Example">
        //       <IconButton onClick={() => setTabTo(DiffToggleStates.EXAMPLE)} size="small" disableRipple disableFocusRipple>
        //
        //     </LightTooltip>
        //   </div>
        // ) : (
        //   <div className={classes.toggle} style={{backgroundColor: toggleColor}}>
        //     <LightTooltip title="Show Shape">
        //       <IconButton onClick={() => setTabTo(DiffToggleStates.SHAPE)} size="small" disableRipple disableFocusRipple>
        //         <TocIcon style={{height: 20, width: 20, color: '#f9f9f9'}}/> </IconButton>
        //     </LightTooltip>
        //   </div>
        // );

        return (
          <div className={classes.diffShow}>
            <DocSubGroup title="Observed Diff">
              <Typography variant="subtitle2" style={{marginTop: 3}}>{description.title}</Typography>
              <Typography variant="caption" component="div" style={{
                marginTop: 3,
                textAlign: 'right',
                color: DocDarkGrey
              }}>Seen {interactions.length} times</Typography>
            </DocSubGroup>

            <DocSubGroup title="Suggested Changes">
              <List dense>
                {selectedDiff && interpretations.map((interpretation, index) => {
                  return (
                    <InterpretationRow
                      action={interpretation.title}
                      description={interpretation.description}
                      active={selectedInterpretation && CompareEquality.betweenWithoutCommands(selectedInterpretation, interpretation)}
                      confirm={() => acceptSuggestion(selectedInterpretation, selectedDiff, approvedKey)}
                      onClick={() => setSelectedInterpretation(interpretation, index)}/>
                  );
                })}
                <IgnoreDiffContext.Consumer>
                  {({ignoreDiff}) => <InterpretationRow
                    action={'Ignore this Diff'}
                    description={''}
                    active={false}
                    onClick={() => {
                      ignoreDiff(selectedDiff)
                      setSelectedDiff(null)
                    }}/>}
                </IgnoreDiffContext.Consumer>
              </List>

                <div style={{textAlign: 'center', marginTop: 12}}>
                  <DocDivider style={{marginBottom: 12}}/>
                  {previewButton}
                  <Button size="small" color="secondary" variant="contained"
                          disableRipple
                          style={{marginLeft: 12}} disabled={!Boolean(selectedInterpretation)}
                          onClick={() => {
                            acceptSuggestion(selectedInterpretation, selectedDiff, approvedKey);
                          }}>Confirm</Button>
                </div>

            </DocSubGroup>
          </div>
        );
      })()}

      {!selectedDiff && (
        <div className={classes.emptyDiff}>
          <img src="/optic-logo.svg" width={75} style={{marginTop: -150}}/>
          <Typography variant="h6" style={{fontSize: 16}}>Optic Observed {regions.allCount} Diffs</Typography>
          <Typography variant="caption">Click any diff to review</Typography>
        </div>
      )}

    </Paper>
  );
}

export default withDiffToggleContext(withDiffContext(DiffDrawer));
