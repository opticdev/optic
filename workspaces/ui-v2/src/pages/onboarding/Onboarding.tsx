import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Page } from '<src>/components';
import { useAppSelector } from '<src>/store';
import { useAppConfig } from '<src>/contexts/config/AppConfiguration';
import { useAsyncMemo } from 'use-async-memo';
import { Checkbox, Typography } from '@material-ui/core';
import {
  CapturesServiceContext,
  useCaptures,
} from '<src>/hooks/useCapturesHook';

const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '60%',
    marginTop: theme.spacing(2),
  },
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface OnboardingData {
  specs_shared_with_team: number;
  specs_shared_not_with_team: number;
  specs_uploaded_by_gitbot: number;
  coverages_uploaded: number;
}

const emptyOnboardingData: {
  [key in keyof OnboardingData]: { total: number; users: number };
} = {
  specs_shared_with_team: {
    total: 0,
    users: 0,
  },
  specs_shared_not_with_team: {
    total: 0,
    users: 0,
  },
  specs_uploaded_by_gitbot: {
    total: 0,
    users: 0,
  },
  coverages_uploaded: {
    total: 0,
    users: 0,
  },
};

export default function Onboarding() {
  const classes = useStyles();

  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );

  const captures = useCaptures();
  const capturesService = React.useContext(CapturesServiceContext);

  const captureStatuses = useAsyncMemo(async () => {
    if (!captures.loading && !captures.error && capturesService) {
      const captureStatuses = await Promise.all(
        captures.captures.map((cap) =>
          capturesService.getCaptureStatus(cap.captureId)
        )
      );

      return captureStatuses.reduce(
        (accum, curr) => {
          if (curr.metadata?.taskName === 'test') {
            accum.test += curr.interactionsCount;
          } else {
            accum.regular += curr.interactionsCount;
          }

          return accum;
        },
        { regular: 0, test: 0 }
      );
    } else {
      return { regular: 0, test: 0 };
    }
  }, [captures, capturesService]);

  const {
    backendApi: { domain: baseDomain },
  } = useAppConfig();

  const onboardingData = useAsyncMemo(async () => {
    if (baseDomain && specId) {
      const onboardingResponse = await fetch(
        `${baseDomain}/api/public-specs/onboarding-by-analytics-id/${specId}`
      );

      if (!onboardingResponse.ok) {
        return emptyOnboardingData;
      }

      const data: {
        by_person: { [key: string]: OnboardingData };
      } = await onboardingResponse.json();
      return Object.entries(data.by_person).reduce(
        (accum, [person_id, data]) => {
          Object.entries(data).forEach(([k, v]) => {
            if (v > 0) {
              accum[k as keyof typeof accum].total += v;
              accum[k as keyof typeof accum].users += 1;
            }
          });
          return accum;
        },
        emptyOnboardingData
      );
    }
  }, [baseDomain, specId]);

  return (
    <Page>
      <Page.Navbar />
      <Page.Body>
        <div className={classes.root}>
          {onboardingData ? (
            <div className={classes.body}>
              <Typography variant="h3" align="center">
                Onboarding
              </Typography>
              {/* {JSON.stringify(captures,null,4)} */}
              {/* {JSON.stringify(captureStatuses,null,4)} */}
              <Typography>
                <Checkbox
                  indeterminate={
                    captureStatuses.regular > 0 && captureStatuses.regular < 5
                  }
                  checked={captureStatuses.regular >= 5}
                />{' '}
                Capture traffic with Optic: {captureStatuses.regular} / 5
                requests observed
              </Typography>
              <Typography>
                <Checkbox
                  indeterminate={
                    captureStatuses.test > 0 && captureStatuses.test < 5
                  }
                  checked={captureStatuses.test >= 5}
                />{' '}
                Teach optic how to run your API tests: {captureStatuses.test} /
                5 requests observed
              </Typography>
              <Typography>
                <Checkbox
                  checked={onboardingData.specs_shared_with_team.total > 0}
                />{' '}
                Share with your team:{' '}
                {onboardingData.specs_shared_with_team.total} spec(s) shared by{' '}
                {onboardingData.specs_shared_with_team.users}{' '}
                {onboardingData.specs_shared_with_team.users === 1
                  ? 'person'
                  : 'people'}
                .
              </Typography>
              <Typography>
                <Checkbox
                  checked={onboardingData.specs_shared_not_with_team.total > 0}
                />{' '}
                Share with others:{' '}
                {onboardingData.specs_shared_not_with_team.total} spec(s) shared
                by {onboardingData.specs_shared_not_with_team.users}{' '}
                {onboardingData.specs_shared_not_with_team.users === 1
                  ? 'person'
                  : 'people'}
                .
              </Typography>
              <Typography>
                <Checkbox
                  checked={onboardingData.specs_uploaded_by_gitbot.total > 0}
                />{' '}
                Add optic github integration:{' '}
                {onboardingData.specs_uploaded_by_gitbot.total} spec(s)
                automatically uploaded.
              </Typography>
              <Typography>
                <Checkbox
                  checked={onboardingData.coverages_uploaded.total > 0}
                />{' '}
                Add Optic to your CI pipeline:{' '}
                {onboardingData.coverages_uploaded.total} CI runs detected.
              </Typography>
              <Typography>
                <Checkbox checked={false} /> Optic is runing Staging
              </Typography>
              <Typography>
                <Checkbox checked={false} /> API Design-Guide Adopted
              </Typography>
              <Typography>
                <Checkbox checked={false} /> API-First Workflow Enabled ??? name
                may change
              </Typography>
            </div>
          ) : null}
        </div>
      </Page.Body>
    </Page>
  );
}
