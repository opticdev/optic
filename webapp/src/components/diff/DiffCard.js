import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { withEditorContext } from '../../contexts/EditorContext';
import Card from '@material-ui/core/Card';
import { CardHeader, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import ReactJson from 'react-json-view';
import { AddedGreen } from '../../contexts/ColorContext';


const styles = theme => ({
  header: {
    backgroundColor: AddedGreen,
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
    // position: 'fixed',
    // top: 90,
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

export function ExampleToolTip({ children, example }) {

  const inner = typeof example === 'string' ? <pre>{example}</pre> : (
    <ReactJson
      src={example}
      enableClipboard={false}
      name={false}
      displayDataTypes={false}
    />
  );
  const title = (
    <div style={{ maxHeight: 400, maxWidth: 400, overflow: 'scroll' }}>
      {inner}
    </div>
  )
  return (
    <LightTooltip title={inner} interactive={true} placement="bottom-start">
      {children}
    </LightTooltip>
  );
}

class DiffCard extends React.Component {

  render() {
    const { classes, interpretation, ignore, accept, cardForm } = this.props;
    const { title, description } = interpretation;

    const canApprove = true

    return (
      <Card className={classes.root} elevation={1}>
        <CardHeader title={
          <div style={{ display: 'flex' }}>
            <Typography variant="subtitle1" style={{ marginTop: 2 }}>{title}</Typography>
            <div style={{ flex: 1 }} />
          </div>
        } className={classes.header} />
        <CardContent style={{ padding: 0, maxHeight: 400, overflow: 'auto' }}>
          <div className={classes.description}>
            <Typography variant="paragraph" dangerouslySetInnerHTML={{ __html: description }} />

            {cardForm ? (
              <div className={classes.questions}>
                <Divider style={{ marginTop: 11, marginBottom: 11 }} />
                {cardForm}
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" onClick={accept} disabled={!canApprove}>
            Approve
            </Button>
          <Button size="small" color="secondary" onClick={ignore}>
            Ignore
            </Button>
        </CardActions>
      </Card>);
  }
}

export default withEditorContext(withStyles(styles)(DiffCard));
