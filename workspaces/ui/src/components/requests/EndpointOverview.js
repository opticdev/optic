import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from './DocGrid';
import {DocDivider} from './DocConstants';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import {EndpointOverviewCodeBox} from './DocCodeBox';
import Button from '@material-ui/core/Button';
import SubjectIcon from '@material-ui/icons/Subject';
import {Link} from 'react-router-dom';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {DESCRIPTION, PURPOSE} from '../../ContributionKeys';

const styles = theme => ({
  root: {
    paddingTop: 45,
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 55
  },
  docButton: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
  viewButton: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      textAlign: 'right'
    },
  },
  link: {
    textDecoration: 'none'
  }
});

class EndpointOverview extends React.Component {
  render() {

    const {classes, endpointPurpose, updateContribution, endpointDescription, method, url, parameters = [], baseUrl, requestId} = this.props;

    const left = (
      <div>
        <HeadingContribution
          value={endpointPurpose}
          label="What does this endpoint do?"
          onChange={(newValue) => {
            updateContribution(requestId, PURPOSE, newValue);
          }}
        />

        <div style={{marginTop: 10, paddingLeft: 2, marginBottom: 6}}>
          <MarkdownContribution
            value={endpointDescription}
            label="Detailed Description"
            onChange={(newValue) => {
              updateContribution(requestId, DESCRIPTION, newValue);
            }}
          />
        </div>

        {parameters.length ? (
          <DocSubGroup title="Path Parameters">
            {parameters.map(i => (
              <DocParameter title={i.name}
                            paramId={i.pathId}
                            description={i.description}
                            updateContribution={updateContribution}
              />
            ))}
          </DocSubGroup>
        ) : null}
      </div>
    );
    const docsUrl = `${baseUrl}/requests/${requestId}`;

    const right = (
      <>
        <EndpointOverviewCodeBox method={method.toUpperCase()} url={url}/>
        <div className={classes.viewButton}>
            <Button variant="outlined" color="primary" to={docsUrl} className={classes.link} component={Link}>
              <SubjectIcon style={{marginRight: 6}}/>
              View Documentation
            </Button>
        </div>
      </>
    );

    return (
      <div id={requestId}>
          <div className={classes.root}>
            <DocGrid left={left} right={right}/>
          </div>
          <DocDivider/>
      </div>
    );
  }
}

export default withStyles(styles)(withNavigationContext(EndpointOverview));
