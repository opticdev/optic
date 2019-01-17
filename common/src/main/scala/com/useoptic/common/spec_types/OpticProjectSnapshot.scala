package com.useoptic.common.spec_types

import com.useoptic.common.spec_types.reporting.{ProjectIssue, SpecWarning}

case class OpticProjectSnapshot(
                                 apiSpec: OpticAPISpec,
                                 requestsSpec: Vector[String],
                                 projectIssues: Vector[ProjectIssue],
                                 name: String,
                                 descriptions: Map[String, String] = Map())
