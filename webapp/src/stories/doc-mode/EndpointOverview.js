import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from './DocGrid';
import {ListItemText, Typography} from '@material-ui/core';
import {DocDivider, DocSubHeading, SubHeadingStyles, SubHeadingTitleColor} from './DocConstants';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import DocCodeBox, {EndpointOverviewCodeBox} from './DocCodeBox';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import {DocButton, DocButtonGroup} from './ButtonGroup';

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
});

class EndpointOverview extends React.Component {
  render() {

    const {classes, endpointPurpose, endpointDescription, method, url, parameters = []} = this.props;

    const left = (
      <div>
        <HeadingContribution value={endpointPurpose} label="What does this endpoint do?"/>

        <div style={{marginTop: -6, marginBottom: 6}}>
          <MarkdownContribution value={endpointDescription} label="Detailed Description"/>
        </div>

        {parameters.length ? (
          <DocSubGroup title="Path Parameters">
            {parameters.map(i => <DocParameter title={i.name} id={i.pathId}/>)}
          </DocSubGroup>
        ) : null}
      </div>
    );


    const right = (
      <>
      <EndpointOverviewCodeBox method={method.toUpperCase()} url={url}/>
      <DocButtonGroup style={{marginTop: 22}}>
        <DocButton label="View Documentation" />
      </DocButtonGroup>
      </>
    );

    return (
      <>
        <div className={classes.root}>
          <DocGrid left={left} right={right}/>
        </div>
        <DocDivider/>
      </>
    );
  }
}

export default withStyles(styles)(EndpointOverview);
