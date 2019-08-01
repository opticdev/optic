import {Edit} from '@material-ui/icons';
import React from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import {withRouter} from 'react-router-dom'
import {EditorModes, withEditorContext} from '../../contexts/EditorContext.js'
import {withRfcContext} from '../../contexts/RfcContext.js'
import {RequestsCommands, RequestsHelper} from '../../engine'
import {routerUrls} from '../../routes.js'
import HttpRequestMethodInput from '../http/HttpRequestMethodInput.js'
import PathInput from '../path-editor/PathInput.js'
import {cleanupPathComponentName} from '../path-editor/PathInput.js'
import {asNormalizedAbsolutePath, asPathTrailComponents} from '../utilities/PathUtilities.js'

const useStyles = makeStyles(theme => ({
    root: {
        width: '90%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
}))

function getSteps() {
    return ['Choose request path', 'Choose request methods']
}

function getStepContent(step, combinedState) {
    const {
        initialPathString,
        selectedHttpMethods,
        setSelectedHttpMethods,
        selectedPathComponents,
        setSelectedPathComponents,
        handleNext
    } = combinedState

    switch (step) {
        case 0:
            const s = selectedPathComponents ? toAbsolutePath(selectedPathComponents) : initialPathString
            return [(
                <div>
                    <PathInput onChange={setSelectedPathComponents} onSubmit={handleNext} initialPathString={s}/>
                </div>
            ), selectedPathComponents !== null]
        case 1:
            return [(
                <div>
                    <Typography>What HTTP methods do you want to use?</Typography>
                    <HttpRequestMethodInput
                        onChange={setSelectedHttpMethods}
                        selectedValues={selectedHttpMethods}
                        choices={[
                        {name: 'GET'},
                        {name: 'POST'},
                        {name: 'PUT'},
                        {name: 'PATCH'},
                        {name: 'DELETE'},
                    ]}/>
                </div>
            ), selectedHttpMethods.length > 0]
        default:
            return 'Unknown step';
    }
}

const rootPathComponent = [];

export function normalizePath(pathComponents) {
    return '/' + pathComponents.map(x => x.isParameter ? '{}' : x.name).join('/')
}

export function toAbsolutePath(pathComponents) {
    return '/' + pathComponents.map(x => x.isParameter ? `{${x.name}}` : x.name).join('/')
}

export function prefixes(pathComponents) {
    return pathComponents
        .reduce((acc, pathComponent) => {
            return [
                ...acc,
                [...(lastOrElse(acc, [])), pathComponent]
            ]
        }, [rootPathComponent])
}

export function resolvePath(pathComponents, pathsById) {
    const normalizedPathMap = Object.entries(pathsById)
        .reduce((acc, [pathId, pathComponent]) => {
            const normalizedAbsolutePath = asNormalizedAbsolutePath(asPathTrailComponents(pathId, pathsById))
            acc[normalizedAbsolutePath] = pathComponent
            return acc
        }, {})
    const pathPrefixes = prefixes(pathComponents).reverse()
    // should be guaranteed to have a match of at least [] => '/' (root)
    const lastMatchComponents = pathPrefixes
        .find((pathComponentPrefix) => {
            const normalized = normalizePath(pathComponentPrefix)
            const match = normalizedPathMap[normalized]
            return !!match
        })


    const normalized = normalizePath(lastMatchComponents)
    const lastMatch = normalizedPathMap[normalized]

    const lengthDifference = pathComponents.length - lastMatchComponents.length;
    const toAdd = lengthDifference <= 0 ? [] : pathComponents.slice(-1 * lengthDifference)
    return {
        lastMatch,
        toAdd
    }
}

function lastOrElse(array, defaultValue) {
    const length = array.length;
    return length === 0 ? defaultValue : array[length - 1]
}

function handleSubmit(state, props) {
    const {selectedPathComponents, selectedHttpMethods} = state;
    const {onComplete, baseUrl, history, handleCommand, cachedQueryResults} = props;
    const {pathsById} = cachedQueryResults
    const {toAdd, lastMatch} = resolvePath(selectedPathComponents, pathsById)
    // emit commands to add any necessary paths then go to the final path
    let lastParentPathId = lastMatch.pathId
    toAdd.forEach((addition) => {
        const pathId = RequestsHelper.newId()
        const command = (addition.isParameter ? RequestsCommands.AddPathParameter : RequestsCommands.AddPathComponent)(
            pathId,
            lastParentPathId,
            cleanupPathComponentName(addition.name)
        )
        handleCommand(command)
        lastParentPathId = pathId
    })
    selectedHttpMethods.forEach((method) => {
        const requestId = RequestsHelper.newId()
        const command = RequestsCommands.AddRequest(requestId, lastParentPathId, method)
        handleCommand(command)
    })
    onComplete()
    // maybe this should happen in the consumer
    const {switchEditorMode} = props
    switchEditorMode(EditorModes.DESIGN)
    history.push(routerUrls.pathPage(baseUrl, lastParentPathId))
}

function NewRequestStepper(props) {
    const {initialPathString} = props
    const classes = useStyles()
    const [activeStep, setActiveStep] = React.useState(0)
    const [selectedPathComponents, setSelectedPathComponents] = React.useState(null)
    const [selectedHttpMethods, setSelectedHttpMethods] = React.useState([])

    const steps = getSteps()


    function handleNext() {
        setActiveStep(prevActiveStep => prevActiveStep + 1)
    }

    function handleBack() {
        setActiveStep(prevActiveStep => prevActiveStep - 1)
    }

    const combinedState = {
        initialPathString,
        selectedHttpMethods,
        setSelectedHttpMethods,
        selectedPathComponents,
        setSelectedPathComponents,
        handleNext,
    }

    function handleFinish() {
        handleSubmit(combinedState, props)
    }

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => {
                    const isLastStep = activeStep === steps.length - 1
                    const nextButtonLabel = isLastStep ? 'Create Requests' : 'Next'
                    const nextButtonAction = isLastStep ? handleFinish : handleNext
                    const [content, nextButtonEnabled] = getStepContent(index, combinedState)
                    return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                            <StepContent>
                                {content}
                                <div className={classes.actionsContainer}>
                                    <div>
                                        <Button
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            className={classes.button}
                                        >Back</Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={nextButtonAction}
                                            className={classes.button}
                                            disabled={!nextButtonEnabled}
                                        >{nextButtonLabel}</Button>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    )
                })}
            </Stepper>
        </div>
    )
}

export default withRouter(withEditorContext(withRfcContext(NewRequestStepper)))
