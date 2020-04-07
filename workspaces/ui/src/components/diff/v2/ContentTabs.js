import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {GenericContextFactory} from '../../../contexts/GenericContextFactory';
import {secondary} from '../../../theme';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ReusableDiffRow from './ReusableDiffRow';
import {Typography} from '@material-ui/core';


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
      setResponseContentType: (e) => this.setState({responseContentType: e}),
      requestContentType: this.state.requestContentType,
      responseStatusCode: this.state.responseStatusCode,
      responseContentType: this.state.responseContentType
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
      fontSize: theme.typography.pxToRem(14),
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

  componentDidMount() {
    const {inRequest, responseContentType, setResponseContentType, setResponseStatusCode, responseStatusCode, requestContentType, options, setRequestContentType} = this.props
    if (inRequest && !requestContentType && options.contentTypes.length > 0) {
      setRequestContentType(options.contentTypes[0])
    }
    if (!inRequest && !responseStatusCode && options.length > 0) {
      setResponseStatusCode(options[0].statusCode)
      setResponseContentType(options[0].contentTypes[0])
    }
  }

  render() {
    const {classes, options, notifications, inRequest, requestContentType, responseContentType, setRequestContentType, setResponseContentType, responseStatusCode, setResponseStatusCode, renderResponse, renderRequest} = this.props;

    const contentTypeTab = inRequest ? requestContentType : responseContentType;
    const setContentTypeTab = inRequest ? setRequestContentType : setResponseContentType;

    const contentTypeOptions = inRequest ? (options.contentTypes || []) :
      (((options.find(i => i.statusCode === responseStatusCode) || {}).contentTypes) || []);

    const children = inRequest ? renderRequest(requestContentType) : renderResponse(responseStatusCode, responseContentType)

    if (inRequest && options.contentTypes.length === 0) {
      return null
    }

    if (!inRequest && options.length === 0) {
      return null
    }

    return (
      <>
        <ReusableDiffRow notifications={notifications}>
          <div className={classes.root}>
            <Typography variant="h6" color="primary">{inRequest ? 'Request' : 'Response'}</Typography>
          </div>
        </ReusableDiffRow>
        <div className={classes.root}>
          {!inRequest && (<ContentStyledTabs
              onChange={(e, newValue) => setResponseStatusCode(newValue)}
              value={responseStatusCode}>
              {options.map(({statusCode}, index) => (
                <ContentStyledTab label={statusCode} value={statusCode}/>
              ))}
            </ContentStyledTabs>
          )}

          <div style={{flex: 1}}/>

          <ContentStyledTabs
            value={contentTypeTab}
            onChange={(e, newValue) => setContentTypeTab(newValue)}>
            {contentTypeOptions.map((contentType) =>
              (<ContentStyledTab label={contentType} value={contentType}/>))}
          </ContentStyledTabs>
        </div>
        <div style={{paddingTop: 22}}>
          {children}
        </div>
      </>
    );
  }
}

export default withRequestTabsContext(withStyles(styles)(ContentTabs));
