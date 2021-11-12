import { Command } from "commander";
import React, { FC, useEffect } from "react";

import { Box, Newline, Text, useApp, render } from "ink";

export const registerUpload = (cli: Command) => {
  // TODO - add in more options and validate required
  cli.command("upload").action(async ({}: {}) => {
    const { waitUntilExit } = render(<Upload />, { exitOnCtrlC: true });
    await waitUntilExit();
  });
};

const Upload: FC = () => {
  return null;
};
