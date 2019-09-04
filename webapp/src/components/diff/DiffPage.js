import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Helmet from 'react-helmet';
import Editor from '../navigation/Editor';
import { withEditorContext } from '../../contexts/EditorContext';
import DiffTopBar from './DiffTopBar'
import DiffCard from './DiffCard';
import ConfirmCard from './ConfirmCard';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing(5),
    flex: 1,
  },
  cardViewRoot: {
    paddingLeft: 22,
    paddingTop: theme.spacing(2),
    paddingRight: 22
  },
  diffCardMargin: {
    paddingLeft: 25,
    paddingRight: 20,
    maxWidth: 480,
    overflow: 'hidden',
    height: '100vh !important',
  }
});



class DiffPage extends React.Component {

  constructor(props) {
    super(props)
    this.scrollContainerRef = React.createRef()
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.path !== this.props.path) {
      setTimeout(() => {
        this.scrollContainerRef.current.scrollTo(0, 0)
        debugger
      })
    }
  }

  render() {
    const { classes, children, collapseLeftMargin, interpretation, accept, readyToFinish, finish, progress } = this.props

    const card = (() => {
      if (readyToFinish) {
        return <ConfirmCard finish={finish} />
      }

      if (interpretation) {
        return <DiffCard interpretation={interpretation} accept={accept} />
      }
    })()

    return (
      <Editor
        baseUrl={this.props.baseUrl}
        topBar={<DiffTopBar progress={progress} />}
        collapseLeftMargin={collapseLeftMargin}
        rightMargin={<div className={classes.diffCardMargin}>{card}</div>}
        scrollContainerRef={this.scrollContainerRef}
      >
        <Helmet><title>{"Review Proposed Changes"}</title></Helmet>
        <div className={classes.root}>
          {children}
        </div>
        {/*<CommitChangesModal open={false} />*/}
      </Editor>
    )
  }
}
export default withEditorContext(withStyles(styles)(DiffPage))
