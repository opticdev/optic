import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import {DocDivider} from '../../requests/DocConstants';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {CardActions} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {DiffContext} from './DiffContext';
import {mapScala, CompareEquality} from '@useoptic/domain';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'sticky',
    top: 120
  },
  header: {
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'center',
    paddingLeft: 9,
    paddingTop: 9,
  },
  font: {
    fontSize: 13,
    fontWeight: 400
  },
  icon: {
    paddingRight: 0,
  },
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(1) + 7,
    marginBottom: 7,
  },
}));


export const DiffHelperCard = (props) => {
  const classes = useStyles();
  const {inRequest, inResponse} = props;
  const {selectedInterpretation, setSelectedInterpretation, selectedDiff, acceptSuggestion, clearPreview} = useContext(DiffContext);
  const showIt = selectedDiff && selectedDiff.inRequest && inRequest || selectedDiff.inResponse && inResponse;

  if (!showIt) {
    return null;
  }

  const suggestions = selectedDiff.suggestions;


  return (
    <div className={classes.root}>
      <Card elevation={3}>
        <div className={classes.header}>
          <Typography className={classes.font} variant="subtitle1">New Field X was observed in response
            body</Typography>
          <div style={{flex: 1, minWidth: 20}}/>
          <PulsingOptic />
        </div>

        <DocDivider style={{marginBottom: 10}}/>
        <FormControl component="fieldset" className={classes.formControl}>
          <RadioGroup>
            {mapScala(suggestions)(suggestion => {
              return <FormControlLabel
                onClick={() => setSelectedInterpretation(suggestion)}
                control={<Radio color="primary"  value={suggestion} checked={selectedInterpretation && CompareEquality.betweenWithoutCommands(suggestion, selectedInterpretation)}/>}
                label={<Typography variant="subtitle2">{suggestion.title}</Typography>}
              />
            })}
            {/*<FormControlLabel value="female" control={<Radio color="primary" />} label="Female" />*/}
            {/*<FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />*/}
            {/*<FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />*/}
          </RadioGroup>
        </FormControl>
        <CardActions style={{float: 'right', marginTop: -22}}>
          <Button size="small" onClick={clearPreview}>Ignore</Button>
          <Button color="primary" size="small" onClick={() => acceptSuggestion(selectedInterpretation)}>Approve</Button>
        </CardActions>
      </Card>
    </div>
  );
};


export const PulsingOptic = () => (
  <div className={'blob'} style={{marginRight: 9}}>
    <img src="/optic-logo.svg" width={32} height={32}/>
  </div>
)
