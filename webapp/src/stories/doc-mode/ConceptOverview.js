import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from './DocGrid';
import {ListItemText, Typography} from '@material-ui/core';
import {DocDivider, DocSubHeading, SubHeadingStyles, SubHeadingTitleColor} from './DocConstants';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import DocCodeBox, {EndpointOverviewCodeBox, ExampleShapeViewer} from './DocCodeBox';
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
  list: {
    paddingLeft: 16
  }
});

class ConceptOverview extends React.Component {
  render() {

    const {classes, name, description, example, shapeId} = this.props;

    const left = (
      <div>
        <HeadingContribution value={name} label="What is this concept called?"/>
        <div style={{marginTop: -6, marginBottom: 6}}>
          <MarkdownContribution value={description} label="What is this concept used for?"/>
        </div>
        <DocSubGroup title="Usages">
          <ul className={classes.list}>
            <li><Typography variant="overline">Create New Pet</Typography></li>
            <li><Typography variant="overline">Lookup Pet</Typography></li>
            <li><Typography variant="overline">Buy Pet</Typography></li>
          </ul>
        </DocSubGroup>
      </div>
    );


    const right = (
      <ExampleShapeViewer
        title={name}
        shapeId={shapeId}
        example={example} />
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

export default withStyles(styles)(ConceptOverview);
