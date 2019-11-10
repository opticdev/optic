import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from '../requests/DocGrid';
import {DocDivider} from '../requests/DocConstants';
import {HeadingContribution, MarkdownContribution} from '../requests/DocContribution';
import {ShapeOnly} from '../requests/DocCodeBox';
import {HighlightedIDsStore} from '../shapes/HighlightedIDs';
import {StickyRegion} from '../shared/StickyRegion';

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

    const {classes, name, description, shapeId} = this.props;

    const left = (
      <StickyRegion>
        <div>
          <HeadingContribution value={name} label="What is this concept called?"/>
          <div style={{marginTop: -6, marginBottom: 6}}>
            <MarkdownContribution value={description} label="What is this concept used for?"/>
          </div>
          {/*<DocSubGroup title="Usages">*/}
          {/*  <ul className={classes.list}>*/}
          {/*    <li><Typography variant="overline">Create New Pet</Typography></li>*/}
          {/*    <li><Typography variant="overline">Lookup Pet</Typography></li>*/}
          {/*    <li><Typography variant="overline">Buy Pet</Typography></li>*/}
          {/*  </ul>*/}
          {/*</DocSubGroup>*/}
        </div>
      </StickyRegion>
    );


    const right = (
      <HighlightedIDsStore>
        <ShapeOnly
          title={name}
          shapeId={shapeId}/>
      </HighlightedIDsStore>
    );

    return (
      <div id={shapeId}>
          <div className={classes.root}>
            <DocGrid left={left} right={right}/>
          </div>
          <DocDivider/>
      </div>
    );
  }
}

export default withStyles(styles)(ConceptOverview);
