import { Argument, Command } from 'commander';
import { addOperation, newResource } from './workflows';

export function runCommand() {
  const runCommand = new Command('run');

  runCommand.addCommand(addOperationCommand());
  runCommand.addCommand(newResourceCommand());

  return runCommand;
}

function newResourceCommand() {
  const command = new Command('new-resource')
    .addArgument(new Argument('<resource-name>', '[resource-name]'))
    .addArgument(
      new Argument('<plural-resource-name>', '[plural-resource-name]')
    )
    .action(async (args) => {
      const [resourceName, pluralResourceName] = args;
      return newResource(resourceName, pluralResourceName);
    });

  return command;
}

function addOperationCommand() {
  const command = new Command('add-operation')
    .addArgument(new Argument('<openapi>', 'path to openapi file'))
    .addArgument(new Argument('<operation>', '[operation]'))
    .addArgument(new Argument('<resource-name>', '[resource-name]'))
    .addArgument(
      new Argument('<plural-resource-name>', '[plural-resource-name]')
    )
    .action(async (args) => {
      const [specFilePath, operation, resourceName, pluralResourceName] = args;
      return addOperation(
        specFilePath,
        operation,
        resourceName,
        pluralResourceName
      );
    });

  return command;
}
