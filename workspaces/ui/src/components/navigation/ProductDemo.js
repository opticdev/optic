import React, {useEffect, useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {createStyles, DialogContent, DialogTitle, LinearProgress, Typography} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import {GenericContextFactory} from '../../contexts/GenericContextFactory';
import {simulateSession} from '../loaders/ExampleSessionsLoader';
import Tour from 'reactour';
import {primary, secondary} from '../../theme';
import Grid from '@material-ui/core/Grid';
import {DocDivider} from '../requests/DocConstants';
import {MarkdownRender} from '../requests/DocContribution';
import {withRouter} from 'react-router-dom';

const useStyles = makeStyles((theme) => createStyles({
  root: {},
  noPadding: {
    padding: '0 !important'
  },
  helperRoot: {
    display: 'flex',
  },
  content: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 12,
    paddingLeft: 14,
    paddingTop: 14
  },
  text: {
    ...theme.typography.subtitle1,
    paddingTop: 10,
  }
}));

const startSteps = [
  {
    content: ({goTo}) => (<Step title={'Welcome to Optic'}>
      <MarkdownRender source={`Optic uses real API traffic to document and test your API as you develop it.`}/>
      <div style={{textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column'}}>
        <Typography variant="overline" style={{marginRight: 12}}>Let's do a quick demo</Typography>
        <Button color="primary" variant="contained" onClick={() => {
          simulateSession();
          goTo(1);
        }}>Simulate API Traffic</Button>
      </div>
    </Step>),
  },
  {
    selector: '#navbar',
    content: (
      <Step title={'API Diff'}>
        <MarkdownRender source={`
Optic alerts you whenever your API and its OpenAPI specification are not in sync. Click 'Not Synced' to review the API diff.`}/>
      </Step>
    ),
  },
];

const newUrlSteps = [
  {
    selector: '#new-url',
    content: ({goTo}) => (<Step title={'Document a new API Endpoint'}>
      <MarkdownRender
        source={`Optic observed traffic to URLs that are not in your API spec. Choose a URL to start documenting it`}/>
    </Step>),
  }
];
const newUrl2Steps = [
  {
    selector: '#new-url-match',
    content: ({goTo}) => (<Step title={'Add a Path for the URL'}>
      <MarkdownRender
        source={'Before you can add an endpoint to your spec, you need to provide a path that matches the URL. \n ie: \`/users/\:userId/profile\`' + `

- If part of the URL is a path parameter, use \`:param\`
- The URL with turn green as you write your matcher`}/>

    </Step>),
  }
];

const requestDiffDemoSteps = [
  {
    // selector: '#new-url',
    content: ({goTo}) => (<Step title={'What is a Request Diff?'}>
      <MarkdownRender
        source={`Optic detects whenever API traffic does not follow your API specification. This is sort of like running \`git diff\` for your API.`}/>

      <div style={{textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column'}}>
        <Button variant="contained" color="primary" onClick={() => goTo(1)}>Start Reviewing the Diff</Button>
      </div>
    </Step>),
  },
  {
    selector: '#diff-observed',
    content: ({goTo}) => (<Step title={'Observation'}>
      <MarkdownRender
        source={`On the left side of the screen, Optic shows you the request/response that did not match your API specification`}/>
      <div style={{textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column'}}>
        <Button variant="contained" color="primary" onClick={() => goTo(2)}>Next</Button>
      </div>
    </Step>),
  },
  {
    selector: '#interpretation-card',
    position: 'left',
    content: ({goTo}) => (<Step title={"Review Optic's Suggested Changes"}>
      <MarkdownRender
        source={`Optic makes it easy to keep your API and Spec in sync.\n Just Press \`Approve\` and Optic will update the OpenAPI spec for you`}/>
    </Step>),
  }
];

const {
  Context: ProductDemoContext,
  withContext: withProductDemoContext
} = GenericContextFactory(null);

function ProductDemoStoreBase(props) {

  const classes = useStyles();

  const [showStart, setShowStart] = useState(true);

  const active = props.active;

  useEffect(() => {
    props.history.listen(() => {
      // Detecting, user has changed URL
      const wasDashboard = props.location.pathname.endsWith('/dashboard');
      if (wasDashboard) {
        setShowStart(false);
      }
    });
  });

  const OTour = (props) => {

    const [show, setShow] = useState(true)

    return (<Tour
      accentColor={secondary}
      className={classes.noPadding}
      disableDotsNavigation={true}
      showNavigationNumber={false}
      showButtons={false}
      closeWithMask={true}
      showNumber={false}
      showCloseButton={false}
      showNavigation={false}
      {...props}
      isOpen={show && props.isOpen}
      onRequestClose={() => {
        setShow(false)
        simulateSession()
      }}
    />)
  };

  const dashboardDemo = <OTour steps={startSteps} isOpen={showStart}/>;

  const shouldShowURLDemo = !localStorage.getItem('new-url-reached-step-3');
  const newUrlDemo1 = (showWhen) => shouldShowURLDemo && <OTour steps={newUrlSteps} isOpen={showWhen}/>;
  const newUrlDemo2 = (showWhen) => shouldShowURLDemo && showWhen &&
    <Delay forMillis={500}><OTour steps={newUrl2Steps} isOpen={showWhen}/></Delay>;


  const requestDiffDemo = (showWhen) => <OTour steps={requestDiffDemoSteps} isOpen={showWhen}/>;

  const context = {
    active,
    demos: {
      dashboardDemo,
      newUrlDemo1,
      newUrlDemo2,
      requestDiffDemo
    }
  };

  if (!active) {
    return (
      <ProductDemoContext.Provider value={{...context, demos: {}}}>{props.children}</ProductDemoContext.Provider>
    );
  }

  return (
    <ProductDemoContext.Provider value={context}>
      {props.children}
    </ProductDemoContext.Provider>
  );
}

const ProductDemoStore = withRouter(ProductDemoStoreBase);

export {
  ProductDemoStore,
  withProductDemoContext
};

function Delay({forMillis, children}) {

  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), forMillis);
  });

  if (!show) {
    return null;
  } else {
    return children;
  }

}

function Step({title, children}) {

  const classes = useStyles();

  return (
        <div className={classes.content}>
          <Typography variant="h5" style={{textAlign: 'center', fontWeight: 100}}>{title}</Typography>
          <DocDivider/>
          <div className={classes.text}>
            {children}
          </div>
        </div>
  );
}
