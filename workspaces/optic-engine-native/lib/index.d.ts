/// <reference types="node" />

import { Readable } from 'stream';
import { Streams } from '@useoptic/optic-streams';

export function diffInteractions(input: {
  specPath: string;
  interactionsStream: AsyncIterable<Streams.HttpInteractions.HttpInteraction>;
}): Readable;

export function readSpec({ specDirPath: string }): Readable;

export interface CommitOptions {
  specDirPath: String;
  commitMessage: String;
  appendToRoot?: boolean;
  clientSessionId: String;
  clientId: String;
}

export function commit(
  commands: AsyncIterable<Streams.Commands.Command>,
  CommitOptions
): Readable;

export function learnShapeDiffAffordances(
  commands: AsyncIterable<Streams.HttpInteractions.HttpInteraction>,
  { diffResultsPath: string, specPath: string }
): Readable;

export function learnUndocumentedBodies(
  commands: AsyncIterable<Streams.HttpInteractions.HttpInteraction>,
  { specPath: string }
): Readable;

export interface DiffEngineError extends Error {
  // The numeric exit code of the diff engine process that was run.
  exitCode: number;
  // Whether the diff failed to run.
  failed: boolean;

  // Whether the diff engine process timed out.
  timedOut: boolean;

  // Whether the diff engine process was killed.
  killed: boolean;

  // The name of the signal that was used to terminate the diff engine process. For example, `SIGFPE`.
  // If a signal terminated the process, this property is defined and included in the error message. Otherwise it is `undefined`.
  signal?: string;

  // A human-friendly description of the signal that was used to terminate the process. For example, `Floating point arithmetic error`.
  // If a signal terminated the process, this property is defined and included in the error message. Otherwise it is `undefined`. It is also `undefined` when the signal is very uncommon which should seldomly happen.
  signalDescription?: string;
}
