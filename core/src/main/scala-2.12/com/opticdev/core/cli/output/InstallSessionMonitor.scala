package com.opticdev.core.cli.output

class InstallSessionMonitor(process: String) extends CliSessionMonitor(process, 5) {

  def validateDescription = StateChange(1, "Validating Description")
  def parsingSnippets = StateChange(2, "Parsing Snippets")
  def evaluatingFinders = StateChange(3, "Evaluating Finders")
  def writingParser = StateChange(4, "Writing Parser")
  def writingGenerator = StateChange(4, "Writing Generator")
  def gearFinished = StateChange(5, "Finished", true)

}
