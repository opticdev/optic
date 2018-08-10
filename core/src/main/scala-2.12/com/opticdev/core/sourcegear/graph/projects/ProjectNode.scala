package com.opticdev.core.sourcegear.graph.projects

import java.util.Date

import com.opticdev.core.sourcegear.graph.AstProjection
import com.opticdev.parsers.graph.BaseNode

case class ProjectNode(name: String, rootDirectory: String, lastUpdated: Date) extends AstProjection
