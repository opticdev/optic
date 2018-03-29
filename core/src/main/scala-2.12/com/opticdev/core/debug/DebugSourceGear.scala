package com.opticdev.core.debug

import com.opticdev.core.sourcegear
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.parsers.ParserBase
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.{Lens, Schema}
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.markdown.MarkdownParser

import scala.util.{Failure, Success, Try}

class DebugSourceGear extends SourceGear {

  override val parsers: Set[ParserBase] = Set()
  override val gearSet: GearSet = new GearSet()
  override val transformations: Set[Transformation] = Set()
  override val schemas: Set[Schema] = Set()

  override def parseString(string: String)(implicit project: OpticProject): Try[sourcegear.FileParseResults] = {
    MarkdownParser.parseMarkdownString(string) match {
      case Success(mDParseOutput) => {
        null
      }
      case Failure(t) => Failure(t)
    }

  }

}

object DebugSourceGear {
//  def lensToCommonAST(lens: Lens) : CommonAstNode = {
//
//  }
}
