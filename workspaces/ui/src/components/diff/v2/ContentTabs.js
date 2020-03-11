import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {secondary} from '../../../theme';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ReusableDiffRow from './ReusableDiffRow';


const {
  Context: RequestTabsContext,
  withContext: withRequestTabsContext
} = GenericContextFactory(null);

class RequestTabsContextStore extends React.Component {

  state = {
    requestContentType: null,
    responseStatusCode: null,
    responseContentType: null
  };

  render() {
    const context = {
      setRequestContentType: (e) => this.setState({requestContentType: e}),
      setResponseStatusCode: (e) => this.setState({responseStatusCode: e}),
      setResponseContentType: (e) => this.setState({responseContentType: e})
    };

    return (
      <RequestTabsContext.Provider value={context}>
        {this.props.children}
      </RequestTabsContext.Provider>
    );
  }
}

export {
  RequestTabsContextStore,
  withRequestTabsContext
};


const ContentStyledTabs = withStyles({
  root: {
    height: 29,
    minHeight: 'inherit'
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    color: secondary,
    backgroundColor: 'transparent',
    '& > div': {
      width: '100%',
      backgroundColor: secondary,
    },
  },
})(props => <Tabs {...props} TabIndicatorProps={{children: <div/>}}/>);

const ContentStyledTab = withStyles(theme => {
  return ({
    root: {
      textTransform: 'none',
      color: '#707070',
      padding: 0,
      marginTop: 5,
      height: 25,
      minHeight: 'inherit',
      minWidth: 'inherit',
      fontWeight: theme.typography.fontWeightRegular,
      fontSize: theme.typography.pxToRem(12),
      marginRight: theme.spacing(2),
      '&:focus': {
        opacity: 1,
      },
    },
  });
})(props => <Tab disableRipple {...props} />);


const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
  },
});

class ContentTabs extends React.Component {
  render() {
    const {classes, options, notifications} = this.props;
    return (
      <ReusableDiffRow notifications={notifications}>
        <div className={classes.root}>
          <ContentStyledTabs value={0}>
            {options.map(({statusCode}) => (<ContentStyledTab label={statusCode}/>))}
          </ContentStyledTabs>

          <div style={{flex: 1}}/>

          <ContentStyledTabs value={0}>
            {options[0].contentTypes.map((contentType) => (<ContentStyledTab label={contentType}/>))}
          </ContentStyledTabs>
        </div>
      </ReusableDiffRow>
    );
  }
}

export default withRequestTabsContext(withStyles(styles)(ContentTabs));
