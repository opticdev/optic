package com.useoptic.common.spec_types

import com.useoptic.common.spec_types.diff.APISpecChanges
import com.useoptic.common.spec_types.reporting.{AnalysisReport, ProjectIssue, SpecWarning}

case class OpticProjectSnapshot( apiSpec: OpticAPISpec,
                                 requestsSpec: Vector[String],
                                 projectIssues: Vector[ProjectIssue],
                                 descriptions: Map[String, String] = Map(),
                                 report: AnalysisReport = AnalysisReport.empty)
