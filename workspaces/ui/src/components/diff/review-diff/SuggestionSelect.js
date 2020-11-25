import React, { useState } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import Card from '@material-ui/core/Card';
import { plain, code } from '../../../engine/interfaces/interpretors';
import {
  ICopyRender,
  ICopyRenderMultiline,
  ICopyRenderSpan,
} from '../../../components/diff/review-diff/ICopyRender';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { IconButton } from '@material-ui/core';
import { LightTooltip } from '../../../components/tooltips/LightTooltip';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { SubtleBlueBackground } from '../../../theme';
import Grow from '@material-ui/core/Grow';

export function SuggestionSelect(props) {
  const classes = useStyles();
  const { selectedSuggestionIndex, stage, setSelectedSuggestionIndex } = props;
  const { suggestions } = props;

  const [showAll, setShowAll] = useState(false);

  if (!suggestions.length) {
    return null;
  }

  return (
    <Grow in={true} key={suggestions.length} timeout={500}>
      <div style={{ display: 'flex' }}>
        <Card className={classes.bounded} elevation={0}>
          <div style={{ paddingTop: 2, paddingBottom: 2, flexShrink: 1 }}>
            <div className={showAll ? classes.collapseHeight : undefined}>
              <SelectSuggestionItem
                copy={suggestions[selectedSuggestionIndex].action.activeTense}
              />
            </div>
            <Collapse in={showAll} exit={false}>
              {showAll && (
                <List>
                  {suggestions.map((i, index) => (
                    <SelectSuggestionItem
                      button
                      setSuggestion={(newIndex) => {
                        setShowAll(false);
                        setSelectedSuggestionIndex(newIndex);
                      }}
                      index={index}
                      copy={i.action.activeTense}
                      key={index}
                    />
                  ))}
                </List>
              )}
            </Collapse>
          </div>
          <div className={classes.menu}>
            <IconButton
              color="secondary"
              size="small"
              onClick={() => setShowAll(true)}
              disabled={showAll || suggestions.length === 1}
            >
              <span className={classes.numberSpan}>({suggestions.length})</span>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <Button
              size="small"
              color="primary"
              onClick={stage}
              style={{ fontSize: 10, fontWeight: 800 }}
            >
              Approve
            </Button>
          </div>
        </Card>
      </div>
    </Grow>
  );
}

function SelectSuggestionItem(props) {
  const classes = useStyles();
  return (
    <ListItem
      button={props.button}
      className={classes.item}
      style={{ padding: props.button && 5 }}
      onClick={() => {
        if (props.button) {
          props.setSuggestion(props.index);
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ICopyRenderMultiline copy={props.copy} variant="caption" />
      </div>
    </ListItem>
  );
}

const useStyles = makeStyles((theme) => ({
  bounded: {
    paddingLeft: 5,
    alignItems: 'center',
    flexShrink: 1,
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    border: '1px solid #e2e2e2',
  },
  menu: {
    alignItems: 'center',
    display: 'flex',
    marginLeft: 10,
    paddingRight: 4,
    paddingLeft: 8,
    backgroundColor: SubtleBlueBackground,
    borderLeft: '1px solid #e2e2e2',
  },
  item: {
    display: 'flex',
    padding: 0,
  },
  numberSpan: {
    fontFamily: 'Ubuntu Mono',
    fontSize: 12,
  },
  collapseHeight: {
    opacity: 0.2,
    marginLeft: 4,
    marginTop: 5,
    transition: 'opacity .1s ',
  },
}));
