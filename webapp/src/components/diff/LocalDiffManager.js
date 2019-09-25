import React from 'react';
import Typography from '@material-ui/core/Typography';
import { toInteraction, RequestDiffer, JsonHelper, Interpreters, ShapesCommands } from '../../engine/index.js';
import { withSessionContext, DiffStateStatus } from '../../contexts/SessionContext';
import { withStyles } from '@material-ui/core/styles';
import UnmatchedUrlWizard from './UnmatchedUrlWizard';
import { withRfcContext } from '../../contexts/RfcContext';
import DiffPage from './DiffPage';
import { primary } from '../../theme';
import Card from '@material-ui/core/Card';
import { CardActions, CardContent, CardHeader } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { commandsFromJson, NaiveSummary } from '../../engine/index';
import DiffPageWrapper from './DiffPageWrapper';
import { track } from '../../Analytics';
import { GenericSetterContextFactory } from '../../contexts/GenericSetterContextFactory.js';
import TextField from '@material-ui/core/TextField'

const styles = (theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  pathDisplay: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F8F8F8'
  },
  methodDisplay: {
    padding: 6,
    paddingTop: 10,
    paddingLeft: 15,
    fontWeight: 500,
    fontSize: 15,
    fontFamily: 'Ubuntu',
    color: primary
  }
}));
export function isIgnoredDiff(diffState, diff) {
  if (!diffState.ignoredDiffs) {
    return false
  }
  return !!diffState.ignoredDiffs[diff.toString()]
}
export function isStartable(diffState, item) {
  const { index } = item;
  const results = diffState.interactionResults[index] || {};
  return results.status !== 'skipped' && results.status !== 'completed';
}

export function isManuallyIntervened(diffState, item) {
  const { index } = item;
  const results = diffState.interactionResults[index] || {};
  return results.status === 'manual';
}

class LocalDiffManager extends React.Component {

  renderDiffPersisted() {
    return (
      <div>Your API Spec changes have been merged.
        <a href="/saved">View Spec</a>
      </div>
    )
  }

  renderUnrecognizedUrlWidget(item) {
    const { diffSessionManager, diffStateProjections, applyCommands } = this.props;
    const { sampleItemsWithoutResolvedPaths } = diffStateProjections;
    return (
      <DiffPage>
        <UnmatchedUrlWizard
          key={item.sample.request.url}
          onSubmit={({ commands }) => {
            track('Matched New Path');
            applyCommands(...commands);
          }}
          onIgnore={() => {
            track('Ignored Unmatched');
            const sampleItems = sampleItemsWithoutResolvedPaths
              .filter(x => x.sample.request.url === item.sample.request.url);
            sampleItems
              .forEach((item) => {
                diffSessionManager.skipInteraction(item.index);
              });
          }}
          sample={item.sample}
          items={sampleItemsWithoutResolvedPaths}
        />
      </DiffPage>
    )
  }

  renderDiffReadyToMerge() {
    const { eventStore, rfcId } = this.props;
    const { diffSessionManager } = this.props;

    const c = diffSessionManager.diffState.acceptedInterpretations.flatMap(i => i);
    const summary = NaiveSummary.fromCommands(commandsFromJson(c));

    return (
      <DiffPage progress={100}>
        <Card>
          <CardHeader title={
            <Typography variant="h5" color="primary">Your API Spec changes are ready to merge.</Typography>
          } />
          <CardContent style={{ marginTop: -14, paddingTop: 0 }}>
            <ul style={{ fontFamily: 'Ubuntu', fontSize: 13, fontWeight: 11 }}>
              {summary['New Concepts'] ? <li>+{summary['New Concepts']} Concept(s) Added</li> : null}
              {summary['New Operations'] ? <li>+{summary['New Operations']} Operation(s) Added</li> : null}
              {summary['New Paths'] ? <li>+{summary['New Paths']} Path(s) Added</li> : null}
              {summary['New Responses'] ? <li>+{summary['New Responses']} Response(s) Added</li> : null}
            </ul>
          </CardContent>
          <CardActions>
            <div style={{ textAlign: 'right', width: '100%' }}>
              <Button size="large" color="primary"
                onClick={() => {
                  track('Merged Diff', { summary });
                  diffSessionManager.applyDiffToSpec(eventStore, rfcId)
                }}>
                Merge
              </Button>
            </div>
          </CardActions>
        </Card>
      </DiffPage>
    );
  }

  renderUnrecognizedShapeWidget(item, diff, interpretations) {
    const { applyCommands, diffSessionManager } = this.props

    const { Store: ConceptNameStore, Context: ConceptNameContext } = GenericSetterContextFactory({
      names: {},
      selectedInterpretationIndex: 0
    })

    const ConceptNamer = function ({ shapeId }) {
      const { value, setValue } = React.useContext(ConceptNameContext)
      return (
        <div style={{ marginBottom: 15 }}>
          <Typography variant="caption">{interpretations[value.selectedInterpretationIndex].metadataJs.nameRequests[0].description}</Typography>
          <div>
            <TextField
              placeholder={'Name Concept'}
              value={value.names[shapeId] || ''}
              onChange={(e) => setValue({
                ...value,
                names: {
                  ...value.names,
                  [shapeId]: e.target.value
                }
              })} />
          </div>
        </div>
      )
    }
    return (
      <ConceptNameStore>
        <ConceptNameContext.Consumer>
          {(context) => {
            const { value, setValue } = context
            const { names, selectedInterpretationIndex } = value;
            const interpretation = interpretations[selectedInterpretationIndex]
            const { commands, metadataJs } = interpretation
            const { nameRequests } = metadataJs;
            const [nameRequest] = nameRequests
            const { shapeId } = nameRequest;
            const shapeNameCommands = Object.entries(names).map(([shapeId, name]) => ShapesCommands.RenameShape(shapeId, name || ''));
            const allCommands = [...JsonHelper.seqToJsArray(commands), ...shapeNameCommands];
            console.log(commands, allCommands)
            return (
              <DiffPage
                cardForm={
                  <ConceptNamer shapeId={shapeId} />
                }
                interpretation={interpretation}
                accept={() => {
                  track('Provided Concept Name');
                  if (selectedInterpretationIndex === interpretations.length - 1) {
                    applyCommands(...allCommands);
                    diffSessionManager.markDiffAsIgnored(diff.toString())
                  } else {
                    setValue({
                      ...value,
                      selectedInterpretationIndex: selectedInterpretationIndex + 1
                    })
                  }
                }}
                ignore={() => {
                  track('Ignored Concept Name');
                  if (selectedInterpretationIndex === interpretations.length - 1) {
                    applyCommands(...allCommands);
                    diffSessionManager.markDiffAsIgnored(diff.toString())
                  } else {
                    setValue({
                      ...value,
                      selectedInterpretationIndex: selectedInterpretationIndex + 1
                    })
                  }
                }}
              >
                <Typography>{item.sample.request.method} {item.sample.request.url}</Typography>
                <pre>{JSON.stringify(interpretation.metadataJs.example, null, 2)}</pre>
              </DiffPage>
            )
          }}
        </ConceptNameContext.Consumer>

      </ConceptNameStore>
    )
  }

  renderStandardDiffWidget(item, interpretations) {
    const { rfcService, diffSessionManager, diffStateProjections, classes, cachedQueryResults, rfcId, eventStore } = this.props
    const { applyCommands } = this.props;
    const { diffState } = diffSessionManager
    const readyToFinish = interpretations.length === 0;
    return (
      <DiffPageWrapper
        rfcService={rfcService}
        classes={classes}
        cachedQueryResults={cachedQueryResults}
        rfcId={rfcId}
        eventStore={eventStore}
        applyCommands={applyCommands}
        diffSessionManager={diffSessionManager}
        diffStateProjections={diffStateProjections}
        diffState={diffState}
        item={item}
        readyToFinish={readyToFinish}
        interpretations={interpretations}
        onAccept={(commands) => {
          track('Accepted Interaction');
          applyCommands(...commands);
        }}
        onIgnore={() => {
          track('Ignored Interaction');
          diffSessionManager.skipInteraction(item.index);
        }}
      />
    )
  }

  render() {
    const { queries, rfcId, rfcService } = this.props;
    const { diffSessionManager, diffStateProjections } = this.props;
    const { diffState } = diffSessionManager;
    const { status } = diffState;

    if (status === DiffStateStatus.persisted) {
      return this.renderDiffPersisted(diffState)
    }

    const rfcState = rfcService.currentState(rfcId);
    const urlInterpreter = new Interpreters.UnmatchedUrlInterpreter()
    const { sortedSampleItems } = diffStateProjections;
    const startableSampleItems = sortedSampleItems.filter(x => isStartable(diffState, x))
    for (let item of startableSampleItems) {
      const interaction = toInteraction(item.sample);
      const diff = RequestDiffer.compare(interaction, rfcState);
      const interpretations = JsonHelper.seqToJsArray(urlInterpreter.interpret(diff));
      console.log({ diff, interpretations })
      console.log('xxx1', diff.toString(), interpretations.toString())
      if (interpretations.length > 0) {
        return this.renderUnrecognizedUrlWidget(item)
      }
    }

    const compoundInterpreter = new Interpreters.CompoundInterpreter(rfcState.shapesState)
    for (let item of startableSampleItems) {
      const pathId = queries.resolvePath(item.sample.request.url)

      const interaction = toInteraction(item.sample);
      const diff = RequestDiffer.compare(interaction, rfcState);
      const interpretations = JsonHelper.seqToJsArray(compoundInterpreter.interpret(diff));
      console.log({ diff, interpretations })
      console.log('xxx3', diff.toString(), interpretations.toString())
      return this.renderStandardDiffWidget({ ...item, pathId }, interpretations)
    }

    return this.renderDiffReadyToMerge()
  }
}

export default withSessionContext(withStyles(styles)(withRfcContext(LocalDiffManager)));
