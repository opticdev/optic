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
        <ContentStyledTabs value={mode} onChange={handleChange}>
          <ContentStyledTab
            value="recommended"
            label={
              <LightTooltip title="Our recommended way of running your project locally through the Optic proxy while you develop. Optic automatically starts your process with the upstream port and keeps traffic flowing smoothly.">
                <span>Recommended</span>
              </LightTooltip>
            }
          />
          <ContentStyledTab
            value="manual"
            label={
              <LightTooltip title="When you are targeting a remote service for tesitng or need more control over configuration, manual mode allows you to specify both sides of the proxy at the expense of automatically starting your application as well.">
                <span>Manual</span>
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
