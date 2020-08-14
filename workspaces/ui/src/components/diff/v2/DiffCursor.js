import React, { useContext, useEffect, useState } from 'react';
import { DiffContext } from './DiffContext';
import { useDiffDescription } from './DiffHooks';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { CompareEquality, JsonHelper } from '@useoptic/domain';
import Card from '@material-ui/core/Card';
import { Collapse, withStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import { DocDarkGrey } from '../../docs/DocConstants';
import { DiffToolTip } from './shape_viewers/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import { makeStyles } from '@material-ui/core/styles';
import { UpdatedBlue } from '../../../theme';
import DiffReviewExpanded, {
  DiffReviewExpandedCached,
} from './DiffReviewExpanded';
import { DiffCopy } from './DiffCopy';

const useStyles = makeStyles((theme) => ({
  diffCursor: {
    position: 'sticky',
    top: 0,
    zIndex: 500,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeft: `3px solid ${UpdatedBlue}`,
    alignItems: 'center',
  },
  diffTitle: {
    fontSize: 15,
    fontWeight: 400,
    paddingLeft: 11,
  },
  diffCursorActions: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
  },
  diffItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'baseline',
    paddingLeft: 5,
  },
}));

export class DiffCursor extends React.Component {
  state = {
    showAllDiffs: false,
    selectedDiff: null,
  };

  setSelectedDiff = (selectedDiff) =>
    this.setState({ selectedDiff, showAllDiffs: false });

  toggle = (value) => this.setState({ showAllDiffs: value });

  shouldComponentUpdate = (nextProps, nextState, nextContext) => {
    return (
      !CompareEquality.betweenBodyDiffs(this.props.diffs, nextProps.diffs) ||
      this.state.showAllDiffs !== nextState.showAllDiffs ||
      !this.state.selectedDiff ||
      nextProps.tab !== this.props.tab
    );
  };

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (this.props.diffs.length === 0) {
      if (this.state.selectedDiff) {
        this.setState({ selectedDiff: null });
      }
      return;
    }

    if (this.state.selectedDiff) {
      if (
        !CompareEquality.containsDiff(this.props.diffs, this.state.selectedDiff)
      ) {
        //diff is no longer valid
        this.setSelectedDiff(this.props.diffs[0]);
      }
    } else {
      this.setSelectedDiff(this.props.diffs[0]);
    }
  };

  componentDidMount() {
    this.setSelectedDiff(this.props.diffs[0]);
  }

  render = () => {
    const { diffs, captureId } = this.props;
    const diffCount = diffs.length;
    const { showAllDiffs, selectedDiff } = this.state;

    if (diffCount === 0 || !selectedDiff) {
      return null;
    }

    const props = {
      selectedDiff,
      setSelectedDiff: this.setSelectedDiff,
      diffs,
      diffCount,
      showAllDiffs,
      toggle: this.toggle,
    };
    return (
      <div key={this.props.tab}>
        <Cursor {...props} />
        <DiffReviewExpandedCached
          captureId={captureId}
          key={selectedDiff.diff.toString()}
          {...{ selectedDiff, setSelectedDiff: this.setSelectedDiff }}
        />
      </div>
    );
  };
}

const Cursor = ({
  showAllDiffs,
  diffs,
  setSelectedDiff,
  selectedDiff,
  diffCount,
  toggle,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.diffCursor} elevation={3}>
      <div style={{ flex: 1 }}>
        {!showAllDiffs && selectedDiff && (
          <DiffItem button={false} diff={selectedDiff} />
        )}
        <Collapse in={showAllDiffs} timeout={0}>
          <Typography
            variant="subtitle2"
            style={{ paddingLeft: 12, paddingTop: 12 }}
          >
            Choose a diff to review
          </Typography>
          <List>
            {diffs.map((diff) => (
              <DiffItem
                key={diff.diff.toString()}
                setSelectedDiff={setSelectedDiff}
                toggle={toggle}
                diff={diff}
                button={true}
              />
            ))}
          </List>
        </Collapse>
      </div>
      {!showAllDiffs && (
        <div className={classes.diffCursorActions}>
          <Typography
            variant="overline"
            style={{ color: DocDarkGrey, marginRight: 10 }}
          >
            {diffCount} diffs
          </Typography>
          <DiffToolTip title="See all Diffs">
            <IconButton
              color="primary"
              disabled={diffCount <= 1}
              onClick={() => toggle(true)}
            >
              <MenuOpenIcon />
            </IconButton>
          </DiffToolTip>
        </div>
      )}
    </Card>
  );
};

const DiffItem = ({ diff, button, setSelectedDiff, toggle }) => {
  const description = useDiffDescription(diff);
  const classes = useStyles();

  return (
    <ListItem
      button={button}
      className={classes.diffItem}
      onClick={() => {
        setSelectedDiff(diff);
      }}
    >
      {description && (
        <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 7 }}>
          {button && <div style={{ marginRight: 7 }}>{' • '}</div>}
          <DiffCopy copy={description.titleCopy} fontSize={15} />
        </div>
      )}
    </ListItem>
  );
};
