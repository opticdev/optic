import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DiffToCopy} from './interpreter/DiffCopy';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import {CardContent, CardHeader, ListItemText} from '@material-ui/core';
import {AddedGreen, AddedGreenBackground, ChangedYellow, ChangedYellowBackground} from '../../contexts/ColorContext';
import {primary, secondary} from '../../theme';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';

const styles = theme => ({
  root: {
    width: 380,
    marginTop: 25
  },
  acceptButton: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
  interpretationRegion: {
    paddingLeft: 3,
    marginTop: 10
  }
});


function AcceptButton({classes, selected, selectedColor = primary, selectedBGColor='#e2e2e2', text, onHover, onSelect}) {
  return (
    <ListItem
      button
      disableRipple={true}
      className={classes.acceptButton}
      onMouseEnter={onHover}
      onFocus={onHover}
      autoFocus={selected}
      onClick={onSelect}
      style={{
        borderLeftColor: selected && selectedColor,
        backgroundColor: selected && selectedBGColor,
        padding: 0,
        paddingLeft: 8
      }}>
      {/*<ListItemText>*/}
        <Typography variant="overline" style={{fontSize: 15, textTransform: 'none'}} dangerouslySetInnerHTML={{__html: text}}/>
      {/*</ListItemText>*/}
    </ListItem>
  );
}

class Interpreter extends React.Component {

  render() {
    const {
      diff,
      interpretations,
      accept, ignore,
      queries,
      selectedInterpretationIndex, setInterpretation,
      classes
    } = this.props;

    // return <div>Optic observed {DiffToCopy(diff)}</div>;
    return (
      <Card className={classes.root} elevation={3}>
        <CardContent>
          {DiffToCopy(diff, queries)}
          <List className={classes.interpretationRegion}>

            {interpretations.map((interpretation, index) => {

              const {added, changed} = interpretation.metadataJs;

              const selectedColor = added && AddedGreen || changed && ChangedYellow
              const selectedBGColor = added && AddedGreenBackground || changed && ChangedYellowBackground

              return <AcceptButton text={interpretation.actionTitle}
                                   onHover={() => {
                                     if (index !== selectedInterpretationIndex) {
                                       setInterpretation(index);
                                     }
                                   }}
                                   added={added}
                                   onSelect={accept}
                                   selectedColor={selectedColor}
                                   selectedBGColor={selectedBGColor}
                                   selected={index === selectedInterpretationIndex}
                                   classes={classes}/>;
            })}

            <AcceptButton text="Ignore"
                          classes={classes}
                          selected={null === selectedInterpretationIndex}
                          onHover={() => {
                            setInterpretation(null)
                          }}
                          onSelect={ignore}
                          selectedColor={secondary}/>
          </List>

        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(Interpreter);
