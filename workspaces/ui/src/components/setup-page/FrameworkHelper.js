import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { DocDarkGrey } from '../docs/DocConstants';
import { LightTooltip } from '../tooltips/LightTooltip';
import { ContentStyledTab, ContentStyledTabs } from '../docs/ContentTabs';
import FrameworkSelect from './setup-api/FrameworkSelect';
import { Collapse } from '@material-ui/core';
import { MarkdownRender } from './fetch-docs/BuildMD';
import Chip from '@material-ui/core/Chip';

export function FrameworkHelper({
  mode,
  framework,
  onModeChange,
  onChooseFramework,
}) {
  const handleChange = (event, newValue) => {
    onModeChange(newValue);
  };
  return (
    <>
      <div style={{ paddingBottom: 10 }}>
        <Typography variant="overline" style={{ color: DocDarkGrey }}>
          Choose Integration:
        </Typography>
        <ContentStyledTabs value={mode} onChange={handleChange}>
          <ContentStyledTab
            value="recommended"
            label={
              <LightTooltip
                title={
                  <InnerToolTip
                    recommended
                    children={`Alias your start command with Optic. Use \`api start\` to:
- start your API process
- check your local traffic for API diffs

Recommended for most local development flows
                    `}
                  />
                }
              >
                <span>Start Command</span>
              </LightTooltip>
            }
          />
          <ContentStyledTab
            value="manual"
            label={
              <LightTooltip
                title={
                  <InnerToolTip
                    children={`Manually configure a proxy where Optic monitors traffic. Use when you are developing against:
- a remote service
- a hosted development environment
- a development environment where you need more control
                    `}
                  />
                }
              >
                <span>Proxy</span>
              </LightTooltip>
            }
          />
        </ContentStyledTabs>
      </div>
      <Collapse in={mode === 'recommended'}>
        <FrameworkSelect value={framework} onChoose={onChooseFramework} />
      </Collapse>
    </>
  );
}

function InnerToolTip(props) {
  const { children } = props;
  return (
    <div style={{ width: 300 }}>
      {props.recommended && (
        <Chip color="primary" label="Recommended" size="small" />
      )}
      <div style={{ padding: 6 }}>
        <MarkdownRender source={children} />
      </div>
    </div>
  );
}
