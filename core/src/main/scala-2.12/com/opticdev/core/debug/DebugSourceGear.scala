package com.opticdev.core.debug

import com.opticdev.core.sourcegear
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.parsers.ParserBase
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.markdown.MarkdownParser

import scala.util.Try

class DebugSourceGear extends SourceGear {

  override val parsers: Set[ParserBase] = Set()
  override val gearSet: GearSet = new GearSet()
  override val transformations: Set[Transformation] = Set()
  override val schemas: Set[Schema] = Set()

  override def parseString(string: String)(implicit project: OpticProject): Try[sourcegear.FileParseResults] = {
    MarkdownParser.parseMarkdownString(string)
  }

}

