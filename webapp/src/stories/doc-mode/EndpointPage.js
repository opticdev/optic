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
import {secondary} from '../../theme';
import {DocResponse} from './DocResponse';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Collapse from '@material-ui/core/Collapse';
import {DocRequest} from './DocRequest';
import {DocQueryParams} from './DocQueryParams';

const styles = theme => ({
  root: {
    paddingTop: 45,
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 200
  },
  docButton: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
});

class EndpointPage extends React.Component {

  state = {
    showAllResponses: false
  };

  toggleAllResponses = () => this.setState({showAllResponses: true});

  render() {
    const {classes, endpointPurpose, endpointDescription, method, url, parameters = []} = this.props;

    const endpointOverview = (() => {
      const left = (
        <div>
          <HeadingContribution value={endpointPurpose} label="What does this endpoint do?"/>
          <div style={{marginTop: -6, marginBottom: 6}}>
            <MarkdownContribution value={endpointDescription} label="Detailed Description"/>
          </div>

          {parameters.length ? (
            <DocSubGroup title="Path Parameters">
              {parameters.map(i => <DocParameter title={i}/>)}
            </DocSubGroup>
          ) : null}
        </div>
      );

      const right = <EndpointOverviewCodeBox method={method} url={url}/>;

      return <DocGrid left={left} right={right}/>;
    })();

    const qparams = [{title: 'filter'}, {title: 'count'}, {title: 'id'}];

    const queryParameters = <DocQueryParams parameters={qparams}
                                            example={{
                                              filter: '>50',
                                              count: 12,
                                              id: 'abcdefg'
                                            }}
    />

    const requestBody =  <DocRequest
      description={'Pass along the body to do the thing'}
      fields={[{title: 'fieldA', description: 'does something'}]}
      contentType={'application/json'}
      shapeId={'SHAPE ABC'}
      example={{weAre: 'penn state', state: 'PA'}}
    />

    const firstResponseBody = <DocResponse
      statusCode={200}
      description={'The thing got deleted'}
      fields={[]}
      contentType={'application/json'}
      shapeId={'SHAPE ABC'}
      example={{weAre: 'penn state', state: 'PA'}}
    />;

    return (
      <div className={classes.root}>
        {endpointOverview}
        {queryParameters}
        {requestBody}
        {firstResponseBody}

        {!this.state.showAllResponses && (
          <DocButtonGroup style={{marginTop: 44}}>
            <DocButton label=" ↓ Show Other Responses"
                       color={secondary}
                       onClick={this.toggleAllResponses}/>
          </DocButtonGroup>)
        }
        <Collapse in={this.state.showAllResponses}>
          <DocResponse
            statusCode={403}
            description={'The thing got deleted'}
            fields={[]}
            contentType={'application/json'}
            shapeId={'SHAPE ABC'}
            example={{weAre: 'penn state', state: 'PA'}}
          />
          <DocResponse
            statusCode={404}
            description={'The thing got deleted'}
            fields={[]}
            contentType={'application/json'}
            shapeId={'SHAPE ABC'}
            example={{weAre: 'penn state', state: 'PA'}}
          />
        </Collapse>
      </div>
    );
  }
}

export default withStyles(styles)(EndpointPage);
