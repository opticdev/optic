import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Helmet from 'react-helmet';
import Editor, {Sheet} from '../navigation/Editor';
import {withEditorContext} from '../../contexts/EditorContext';
import DiffTopBar from './DiffTopBar'
import DiffCard from './DiffCard';
import {Button} from '@material-ui/core';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing(2),
    flex: 1
  },
  cardViewRoot: {
    paddingLeft: 22,
    paddingTop: theme.spacing(2),
    paddingRight: 22
  },
  diffCardMargin: {
    paddingLeft: 35,
    paddingRight: 20,
    maxWidth: 480
  }
});



class DiffPage extends React.Component {
  render() {

    const {classes, children, collapseLeftMargin, interpretation, accept, finish} = this.props
    return <Editor
      baseUrl={this.props.baseUrl}
      topBar={<DiffTopBar />}
      collapseLeftMargin={collapseLeftMargin}
      rightMargin={<div className={classes.diffCardMargin}>{interpretation && <DiffCard interpretation={interpretation} accept={accept} />}</div>}
    >
      <Helmet><title>{"Review Proposed Changes"}</title></Helmet>
      <div className={classes.root}>
        <div style={{paddingTop: 20}}>
          {children}
        </div>
      </div>
      {/*<CommitChangesModal open={false} />*/}
    </Editor>
  }
}
export default withEditorContext(withStyles(styles)(DiffPage))
