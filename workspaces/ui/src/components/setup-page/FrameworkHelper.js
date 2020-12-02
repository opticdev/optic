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
              <LightTooltip title="EXAMPLE OF A LOT MORE INFO">
                <span>Recommended</span>
              </LightTooltip>
            }
          />
          <ContentStyledTab
            value="manual"
            label={
              <LightTooltip title="EXAMPLE OF A LOT MORE INFO">
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
