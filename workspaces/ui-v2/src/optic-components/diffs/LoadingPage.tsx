import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Typography, Link} from '@material-ui/core';
import { CircularDiffLoaderProgress } from './CircularDiffProgress';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
const pJson = require('../../../package.json');

type LoadingReviewProps = {
  cursor: number;
  total: number;
  reviewLink: string;
};

export function LoadingReview({
  cursor,
  total,
  reviewLink,
}: LoadingReviewProps) {
  const classes = useStyles();

  if (cursor === total) {
    return (
      <div>
        <Link component={Button} href={reviewLink}>review diffs</Link>
      <Button color="primary" endIcon={<ArrowRightIcon />}>
        Review (19) Diffs
      </Button>
      </div>
    );
  }

  return (
    <div className={classes.loading}>
      <CircularDiffLoaderProgress
        startBlue
        handled={cursor}
        total={total}
        symbol=""
      />

      <div className={classes.rightRegion}>
        <Typography variant="h6" style={{ fontWeight: 200 }}>
          Running Diff...
        </Typography>
        <Typography variant="caption" style={{ fontWeight: 200 }}>
          Diff Engine v{pJson.version}
        </Typography>
      </div>
    </div>
  );
}

// export function ErrorLoadingReviewPage() {
//   const classes = useStyles();
//
//   const { specService } = useServices();
//
//   const { completed, skipped, processed, captureId } = useCaptureContext();
//   const [status, setStatus] = useState(null);
//
//   useEffect(() => {
//     specService.getCaptureStatus(captureId).then((i) => setStatus(i));
//   }, [captureId]);
//
//   const cursor = parseInt(processed) + parseInt(skipped);
//
//   const total = status && status.interactionsCount;
//
//   return (
//     <Page>
//       <Page.Navbar mini={true} />
//       <Page.Body
//         padded={false}
//         style={{
//           flexDirection: 'row',
//           height: '100vh',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <Paper elevation={1} className={classes.loading}>
//           <div>
//             <Typography variant="h6" color="error" style={{ fontWeight: 200 }}>
//               Diff Could Not be Completed
//             </Typography>
//             <Typography variant="caption" style={{ fontWeight: 200 }}>
//               Diff Engine v{pJson.version}
//             </Typography>
//
//             <MarkdownRender
//               source={`
// - Share a debug capture with the Optic team on Slack (JSON values omitted)
// - Revert recent changes to specification.json to get unblocked`}
//             />
//
//             <CodeBlock lang="bash" code={`api debug:capture ${captureId}`} />
//           </div>
//         </Paper>
//       </Page.Body>
//     </Page>
//   );
// }

const useStyles = makeStyles((theme) => ({
  loading: {
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    // border: '1px solid #e2e2e2',
  },
  rightRegion: {
    paddingLeft: 22,
    paddingRight: 22,
    marginLeft: 12,
    borderLeft: '1px solid #e2e2e2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
  },
}));
