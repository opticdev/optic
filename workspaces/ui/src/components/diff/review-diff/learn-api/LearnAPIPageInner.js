import React, { useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCaptureContext } from '../../../../contexts/CaptureContext';
import { useBaseUrl } from '../../../../contexts/BaseUrlContext';
import { getOrUndefined, JsonHelper } from '@useoptic/domain';
import { DiffLoadingOverview } from '../../v2/LoadingNextDiff';
import { NewUrlModal } from '../../v2/AddUrlModal';
import classNames from 'classnames';
import { Show } from '../../../shared/Show';
import isEqual from 'lodash.isequal';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import FilterListIcon from '@material-ui/icons/FilterList';
import { DocDarkGrey, DocGrey } from '../../../docs/DocConstants';
import List from '@material-ui/core/List';
import { PathNameFromId } from '../../../../contexts/EndpointContext';
import ListItem from '@material-ui/core/ListItem';
import { MethodRenderLarge, PathAndMethod } from '../../v2/PathAndMethod';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '@material-ui/core/Chip';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import { secondary } from '../../../../theme';
import TableRow from '@material-ui/core/TableRow';
import Fade from '@material-ui/core/Fade';
import PathMatcher from '../../PathMatcher';
import { LearnAPIPageContext, LearnAPIStore } from './LearnAPIPageContext';
import LearnAPIMenu from './LearnAPIMenu';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import { LightTooltip } from '../../../tooltips/LightTooltip';
import InProgressFullScreen from './InProgressFullScreen';
import { useDiffSession } from '../ReviewDiffSession';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

export function LearnAPIPageInner(props) {
  const { urls, undocumentedEndpoints } = props;
  const { completed } = useCaptureContext();

  return (
    <LearnAPIStore
      allUrls={urls}
      allUndocumentedEndpoints={undocumentedEndpoints}
      key="learning-store"
      onChange={props.onChange}
    >
      <EnhancedTable
        urls={urls}
        undocumentedEndpoints={undocumentedEndpoints}
        key="url-table"
      />
      {urls.length === 0 && !completed && <DiffLoadingOverview show={true} />}
    </LearnAPIStore>
  );
}

const Stat = ({ number, label }) => {
  return (
    <span>
      {number !== 0 && (
        <Typography
          variant="h6"
          component="span"
          color="secondary"
          style={{ fontWeight: 800 }}
        >
          {number}{' '}
        </Typography>
      )}
      <Typography variant="h6" component="span" style={{ fontWeight: 800 }}>
        {number === 0 && 'no '}
        {label}
        {number === 1 ? '' : 's'}
      </Typography>
    </span>
  );
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'method',
    width: 50,
    padding: 'default',
    label: 'Method',
    style: {
      paddingRight: 0,
    },
  },
  { id: 'path', padding: 'none', label: 'Path' },
  {
    id: 'document',
    padding: 'none',
    label: 'Document',
    align: 'right',
    style: {
      paddingRight: 32,
    },
  },
];

function EnhancedTableHead(props) {
  const {
    classes,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            width={headCell.width}
            key={headCell.id}
            align={headCell.align}
            padding={headCell.padding}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{ ...headCell.style, paddingTop: 6, paddingBottom: 6 }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{
                color: DocDarkGrey,
                fontSize: 9,
                textTransform: 'uppercase',
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, endpointsSelected } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Typography
            className={classes.title}
            color="inherit"
            variant="body2"
            component="div"
          >
            {numSelected + endpointsSelected} endpoints to document
          </Typography>
          <div style={{ flex: 1 }} />
          {/*<div style={{ width: 200, display: 'flex' }}>*/}
          {/*  <LearnAPIMenu />*/}
          {/*</div>*/}
        </div>
      ) : (
        <Typography
          className={classes.title}
          variant="body1"
          id="tableTitle"
          component="div"
        >
          Add Endpoints to Specification
        </Typography>
      )}
    </Toolbar>
  );
};

export default function EnhancedTable(props) {
  const classes = useStyles();
  const {
    checkedIds,
    toDocument,
    shouldHideIds,
    highlightAlsoMatching,
    updatePathExpression,
    addRow,
    setIgnore,
    pathExpressions,
    toggleRow,
    endpointsToDocument,
    toggleEndpointsToDocument,
  } = useContext(LearnAPIPageContext);
  const { urls, undocumentedEndpoints } = props;
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (row) => checkedIds.indexOf(row.id) !== -1;

  const filteredUrls = urls.filter((url) => !shouldHideIds.includes(url.id));

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={checkedIds.length}
          endpointsSelected={endpointsToDocument.length}
        />
        <FilterAction
          handleChangePage={handleChangePage}
          paginator={
            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 200]}
              count={filteredUrls.length}
              rowsPerPage={rowsPerPage}
              page={page}
              component="div"
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          }
        />
        <TableContainer>
          <Table
            className={classes.table}
            stickyHeader
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={checkedIds.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={filteredUrls.length}
            />
            <TableBody key="table-body">
              {undocumentedEndpoints.map((endpoint) => {
                return (
                  <UndocumentedEndpointRow
                    endpoint={endpoint}
                    {...{ endpointsToDocument, toggleEndpointsToDocument }}
                    key={endpoint.pathId + endpoint.method}
                  />
                );
              })}

              {stableSort(filteredUrls, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row);
                  const alsoMatchesCurrent = highlightAlsoMatching.includes(
                    row.id
                  );

                  return (
                    <UndocumentedRowWrapper
                      key={row.id}
                      {...{
                        isItemSelected,
                        alsoMatchesCurrent,
                        updatePathExpression,
                        addRow,
                        toDocument,
                        pathExpressions,
                        toggleRow,
                        setIgnore,
                        row,
                      }}
                    />
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

class UndocumentedRowWrapper extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      this.props.row.id !== nextProps.row.id ||
      this.props.isItemSelected !== nextProps.isItemSelected ||
      this.props.alsoMatchesCurrent !== nextProps.alsoMatchesCurrent
    ) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    return <UndocumentedRow {...this.props} />;
  }
}

function UndocumentedRow(props) {
  const classes = useStyles();

  const {
    isItemSelected,
    alsoMatchesCurrent,
    row,
    updatePathExpression,
    addRow,
    pathExpressions,
    toggleRow,
    toDocument,
    setIgnore,
  } = props;

  const handleClick = (row) => {
    toggleRow(row);
  };

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={rowId}
      selected={isItemSelected || alsoMatchesCurrent}
      onClick={(event) => {
        !isItemSelected && handleClick(row);
      }}
      classes={{
        selected: alsoMatchesCurrent
          ? classes.selectedRowMatches
          : classes.selectedRow,
      }}
    >
      <TableCell align="left" style={{ verticalAlign: 'initial' }}>
        <div style={{ marginTop: 2 }}>
          <MethodRenderLarge method={row.method} />
        </div>
      </TableCell>
      <TableCell align="left">
        <PathMatcher
          initialPathString={row.path}
          key={row.path + row.id}
          url={row.path}
          rowId={row.id}
          onUserCompleted={() => {
            addRow(row);
          }}
          onChange={(result) => {
            updatePathExpression(row.id, result);
          }}
        />
      </TableCell>
      <TableCell padding="checkbox" align="right">
        <div className={classes.innerCheck}>
          <Fade in={alsoMatchesCurrent}>
            <Typography
              variant="overline"
              style={{
                color: secondary,
                fontSize: 10,
                textAlign: 'right',
                width: !alsoMatchesCurrent ? 0 : '100%',
              }}
            >
              Matches!
            </Typography>
          </Fade>
          <Fade in={!alsoMatchesCurrent}>
            <Typography
              variant="overline"
              style={{ color: DocDarkGrey, fontSize: 10 }}
            >
              {isItemSelected && !(pathExpressions[row.id] || {}).hasParameters
                ? 'No Path Parameters'
                : ''}
            </Typography>
          </Fade>
          <Fade in={!alsoMatchesCurrent}>
            <Checkbox
              checked={isItemSelected}
              onClick={(event) => handleClick(row)}
              color="primary"
              style={{ marginLeft: 14 }}
            />
          </Fade>
          <LightTooltip
            title={
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                onClick={(e) => e.stopPropagation()}
              >
                Mark this path and method as ignored?{' '}
                <Button color="secondary" onClick={() => setIgnore(row)}>
                  Confirm
                </Button>
              </Box>
            }
            interactive
          >
            <IconButton size="small">
              <RemoveCircleIcon
                fontSizeAdjust="small"
                style={{ width: '.8rem', height: '.8rem' }}
              />
            </IconButton>
          </LightTooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

function UndocumentedEndpointRow(props) {
  const classes = useStyles();
  const { queries } = useDiffSession();

  const { endpoint, endpointsToDocument, toggleEndpointsToDocument } = props;
  const { method, pathId } = endpoint;

  const isSelected = endpointsToDocument.some(
    (i) => i.method === method && i.pathId === pathId
  );

  const descriptor = useMemo(
    () =>
      queries.getEndpointDescriptor({
        method,
        pathId,
      }),
    [pathId, method]
  );

  const { pathTrails, fullPath } = descriptor;

  const handleClick = () => {
    toggleEndpointsToDocument({ method, pathId, pathExpression: fullPath });
  };

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={rowId}
      selected={isSelected}
      onClick={(event) => {
        !isSelected && handleClick();
      }}
      classes={{ selected: classes.selectedRow }}
    >
      <TableCell align="left" style={{ verticalAlign: 'initial' }}>
        <div style={{ marginTop: 2 }}>
          <MethodRenderLarge method={method} />
        </div>
      </TableCell>
      <TableCell align="left">
        <div className={classes.pathPatternRender}>
          {pathTrails.map((i) => {
            const dash = (
              <Typography
                style={{ marginRight: 2, marginLeft: 2, fontWeight: 200 }}
              >
                {'/'}
              </Typography>
            );

            if (i.pathComponentId === 'root') {
              return null;
            } else if (i.isPathParameter) {
              return (
                <>
                  {dash}
                  <Typography className={classes.thick}>{`${
                    i.pathComponentName || '   '
                  }`}</Typography>
                </>
              );
            } else {
              return (
                <>
                  {dash}
                  <Typography className={classes.thin}>
                    {i.pathComponentName || '   '}
                  </Typography>
                </>
              );
            }
          })}
        </div>
      </TableCell>
      <TableCell padding="checkbox" align="right">
        <div className={classes.innerCheck}>
          <LightTooltip title="This path is already in the specification. Check 'Document' to add this method and its bodies specification">
            <Typography
              variant="overline"
              style={{ color: DocDarkGrey, fontSize: 10 }}
            >
              Matches Documented Path
            </Typography>
          </LightTooltip>
          <Checkbox
            checked={isSelected}
            onClick={handleClick}
            color="primary"
            style={{ marginLeft: 14 }}
          />
          <IconButton
            size="small"
            disabled
            onClick={() => {
              // setIgnore(row)
            }}
          >
            <RemoveCircleIcon
              fontSizeAdjust="small"
              style={{ width: '.8rem', height: '.8rem' }}
            />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

function FilterAction({ paginator, handleChangePage }) {
  const classes = useStyles();
  const { setBasepath, basepath } = useContext(LearnAPIPageContext);
  return (
    <div className={classes.filterOuter}>
      <div className={classes.filter}>
        <IconButton size="small" disabled style={{ marginRight: 10 }}>
          <FilterListIcon fontSize="10" />
        </IconButton>
        <LightTooltip title="Basepath filter: Only show URLs that start with a certain path. ie /api">
          <TextField
            inputProps={{
              className: classes.filterInput,
            }}
            placeholder="filter basepath"
            value={basepath}
            onFocus={(e) => {
              e.target.value = '';
              e.target.value = basepath;
            }}
            onChange={(e) => {
              const newValue = e.target.value.replace(/\s+/g, '');
              handleChangePage(null, 0);
              if (!newValue.startsWith('/')) {
                setBasepath('/' + newValue);
              } else {
                setBasepath(newValue);
              }
            }}
          />
        </LightTooltip>
        <div style={{ flex: 1 }} />
        {paginator}
      </div>
    </div>
  );
}

function rowId(row) {
  return `${row.path + row.method + getOrUndefined(row.pathId) || 'new'}`;
}

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    zIndex: 500,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgb(250,250,250)',
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: lighten(theme.palette.primary.light, 0.85),
  },
  title: {
    flex: '1 1 100%',
  },
}));

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '80%',
  },
  filterOuter: {
    position: 'sticky',
    top: 64,
    borderBottom: '1px solid #e2e2e2',
    zIndex: 499,
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
    marginBottom: 400,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  selectedRow: {
    backgroundColor: `${lighten(theme.palette.primary.light, 0.9)} !important`,
  },
  selectedRowMatches: {
    backgroundColor: `${lighten(
      theme.palette.secondary.light,
      0.9
    )} !important`,
  },
  innerCheck: {
    display: 'flex',
    minWidth: 250,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 15,
  },
  filter: {
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgb(250,250,250)',
  },
  filterInput: {
    fontWeight: 100,
    width: 270,
  },
  pathPatternRender: {
    display: 'flex',
    flexDirection: 'row',
    userSelect: 'none',
  },
  thick: {
    fontWeight: 600,
  },
  thin: {
    fontWeight: 100,
  },
}));
