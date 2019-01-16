package com.useoptic.common.spec_types

trait ProjectIssue extends SpecIssue

case class NoTestCommand(title: String = "Test Command not Configured",
                         message: String = "No 'testcmd' defined in 'optic.yml'. This needs to be configured for Optic to learn from running your tests.",
                         identifier: String,
                         doctag: String = "issue-runtime-analysis-support") extends ProjectIssue

case class InvalidAuthDefinition(
                         message: String,
                         identifier: String,
                         title: String = "Invalid Auth Definition",
                         doctag: String = "issue-invalid-auth-definition") extends ProjectIssue

case class IncompleteTestCoverage(apiType: String,
                                  file: String,
                                  lineRange: Range,
                                  contents: String,
                                  message: String,
                                  identifier: String = null,
                                  title: String = "Incomplete Test Coverage",
                                  doctag: String = "issue-incomplete-test-coverage") extends ProjectIssue


//Constructors -- ugly but helps with serialization. expect a refactor
object IncompleteTestCoverage {
  def from(apiType: String, file: String, lineRange: Range, contents: String) =
    IncompleteTestCoverage(apiType, file, lineRange, contents, s"${apiType} not tested at ${file}:${lineRange.start}\n--------\n${contents}\n--------\n", s"${file}.${lineRange}")
}