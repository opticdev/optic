import React, { createRef } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { withEditorContext } from '../../contexts/EditorContext';
import Card from '@material-ui/core/Card';
import { CardHeader, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { primary, secondary } from '../../theme';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import keydown, { Keys } from 'react-keydown';
import TextField from '@material-ui/core/TextField';
import Fade from '@material-ui/core/Fade';
import { everyScala, lengthScala, mapScala, ShapesCommands } from '../../engine';
import Divider from '@material-ui/core/Divider';
import ReactJson from 'react-json-view';


const styles = theme => ({
  header: {
    backgroundColor: '#3ec580',
    color: 'white',
    padding: 2,
    paddingLeft: 12,
  },
  description: {
    padding: 12,
    fontSize: 14,
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    fontSize: 12
  },
  questions: {
    paddingTop: 5,
    display: 'flex',
    flexDirection: 'column'
  },
  root: {
    position: 'fixed',
    top: 90,
    width: 380
  }
});

const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

function ExampleToolTip({ children, example }) {
  const inner = <div style={{ maxHeight: 400, overflow: 'scroll' }}>
    <ReactJson src={example}
      enableClipboard={false}
      name={false}
      displayDataTypes={false}
    />
  </div>;
  return <LightTooltip title={inner} interactive={true} placement="bottom-start">
    {children}
  </LightTooltip>;
}

class DiffCard extends React.Component {

  state = {
    names: {}
  };

  setName = (shapeId, name) => {
    this.setState({ names: { ...this.state.names, [shapeId]: name } });
  };

  componentWillReceiveProps = (nextProps, nextContext) => {
    if (nextProps.interpretation !== this.props.interpretation) {
      this.setState({ names: {} });
    }
  };

  acceptWithNames = () => {
    const renameCommands = Object.entries(this.state.names).map(([shapeId, name]) =>
      ShapesCommands.RenameShape(shapeId, name));
    this.props.accept(renameCommands);
  };

  render() {
    const { classes, interpretation } = this.props;
    const { title, description, nameRequests, exampleJs: bodyExample } = interpretation;

    const canApprove = everyScala(nameRequests)(({ shapeId, required }) => {
      if (required && !this.state.names[shapeId]) {
        return false;
      }
      return true;
    });

    return (
      <Card className={classes.root} elevation={1}>
        <CardHeader title={
          <div style={{ display: 'flex' }}>
            <Typography variant="subtitle1" style={{ marginTop: 2 }}>{title}</Typography>
            <div style={{ flex: 1 }} />
          </div>
        } className={classes.header} />
        <CardContent style={{ padding: 0 }}>
          <div className={classes.description}>
            <Typography variant="paragraph" dangerouslySetInnerHTML={{ __html: description }} />
            {bodyExample && <ExampleToolTip example={bodyExample}>
              <Typography variant="overline" color="primary" style={{ cursor: 'pointer', marginLeft: 7 }}>View
                Example</Typography>
            </ExampleToolTip>}

            <div className={classes.questions} style={{ display: lengthScala(nameRequests) > 0 ? 'inherit' : 'none' }}>
              <Divider style={{ marginTop: 11, marginBottom: 11 }} />
              {mapScala(nameRequests)(({ shapeId, required, description, exampleJs }) => {
                return (
                  <React.Fragment key={shapeId}>
                    <Typography variant="caption">{description}</Typography>
                    <div style={{ display: 'flex' }}>
                      <TextField
                        placeholder={'Name Concept'}
                        value={this.state.names[shapeId] || ''}
                        error={required && !this.state.names[shapeId]}
                        onChange={(e) => this.setName(shapeId, e.target.value)} />
                      <div style={{ width: 30 }} />
                      <ExampleToolTip example={exampleJs}>
                        <Typography variant="overline" color="primary" style={{ cursor: 'pointer', marginLeft: -12 }}>View
                        Example</Typography>
                      </ExampleToolTip>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <CardActions>
            <Button size="small" color="primary" onClick={this.acceptWithNames} disabled={!canApprove}>
              Approve
            </Button>
            <Button size="small" color="secondary">
              Ignore
            </Button>
          </CardActions>
        </CardContent>
      </Card>);
  }
}

export default withEditorContext(withStyles(styles)(DiffCard));
