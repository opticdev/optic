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
import { BreadcumbX } from './DiffPreview';
import { makeStyles } from '@material-ui/core/styles';
import { UpdatedBlue } from '../../../theme';

const useStyles = makeStyles((theme) => ({
  diffCursor: {
    position: 'sticky',
    top: 0,
    zIndex: 500,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeft: `3px solid ${UpdatedBlue}`,
  },
  diffTitle: {
    fontSize: 19,
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
  };

  toggle = (value) => this.setState({ showAllDiffs: value });

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      !CompareEquality.betweenBodyDiffs(this.props.diffs, nextProps.diffs) ||
      !CompareEquality.betweenSelectedDiffs(
        this.props.selectedDiff || undefined,
        nextProps.selectedDiff || undefined
      ) ||
      this.state.showAllDiffs != nextState.showAllDiffs
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.selectedDiff === null && this.props.diffs.length > 0) {
      this.props.setSelectedDiff(this.props.diffs[0]);
      if (this.state.showAllDiffs) {
        this.setState({ showAllDiffs: false });
      }
    }
  }

  render = () => {
    const { selectedDiff, setSelectedDiff, diffs } = this.props;
    const diffCount = diffs.length;
    const { showAllDiffs } = this.state;

    if (diffCount === 0 || !selectedDiff) {
      return null;
    }

    const props = {
      selectedDiff,
      setSelectedDiff,
      diffs,
      diffCount,
      showAllDiffs,
      toggle: this.toggle,
    };

    console.log('aaaaa', props);

    return <Cursor {...props} />;
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
        <Collapse in={showAllDiffs}>
          <Typography variant="subtitle2" style={{ paddingLeft: 12 }}>
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
        toggle(false);
      }}
    >
      {description && (
        <Typography variant="h5" className={classes.diffTitle}>
          {description.title}
          {/*{diff.toString()}*/}
        </Typography>
      )}
      <BreadcumbX location={JsonHelper.seqToJsArray(diff.location)} />
    </ListItem>
  );
};

// export function DiffCursor(props) {
//   const classes = useStyles();
//   const { diffs } = props;
//   const diffCount = diffs.length;
//
//   const { selectedDiff, setSelectedDiff } = useContext(DiffContext);
//
//   const [showAllDiffs, setShowAllDiffs] = useState(false);
//
//   useEffect(() => {
//     if (selectedDiff === null && diffCount > 0) {
//       setSelectedDiff(diffs[0]);
//       setShowAllDiffs(false);
//     }
//   }, [diffs.join((i) => i.toString())]);
//
//   const DiffItem = ({ diff, button }) => {
//     const description = useDiffDescription(diff);
//
//     return (
//       <ListItem
//         button={button}
//         className={classes.diffItem}
//         onClick={() => {
//           setSelectedDiff(diff);
//           setShowAllDiffs(false);
//         }}
//       >
//         {description && (
//           <Typography variant="h5" className={classes.diffTitle}>
//             {description.title}
//             {/*{diff.toString()}*/}
//           </Typography>
//         )}
//         <BreadcumbX location={JsonHelper.seqToJsArray(diff.location)} />
//       </ListItem>
//     );
//   };
//
//   if (!selectedDiff && diffCount === 0) {
//     return null;
//   }
//
//   return (
//     <Card className={classes.diffCursor} elevation={3}>
//       <div style={{ flex: 1 }}>
//         {!showAllDiffs && selectedDiff && (
//           <DiffItem button={false} diff={selectedDiff} />
//         )}
//         <Collapse in={showAllDiffs}>
//           <Typography variant="subtitle2" style={{ paddingLeft: 12 }}>
//             Choose a diff to review
//           </Typography>
//           <List>
//             {diffs.map((diff, n) => (
//               <DiffItem key={n} diff={diff} button={true} />
//             ))}
//           </List>
//         </Collapse>
//       </div>
//       {!showAllDiffs && (
//         <div className={classes.diffCursorActions}>
//           <Typography
//             variant="overline"
//             style={{ color: DocDarkGrey, marginRight: 10 }}
//           >
//             {diffCount} diffs
//           </Typography>
//           <DiffToolTip title="See all Diffs">
//             <IconButton
//               color="primary"
//               disabled={diffCount <= 1}
//               onClick={() => setShowAllDiffs(true)}
//             >
//               <MenuOpenIcon />
//             </IconButton>
//           </DiffToolTip>
//         </div>
//       )}
//     </Card>
//   );
// }
