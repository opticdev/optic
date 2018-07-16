package com.opticdev.core.sourcegear

import com.opticdev.common.{PackageRef, SGExportable}
import com.opticdev.core.sourcegear.gears.parsing.{MultiNodeParseGear, ParseAsModel}
import com.opticdev.core.sourcegear.gears.rendering.{MultiNodeRenderGear, RenderGear}
import com.opticdev.parsers.graph.AstType
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import com.opticdev.sdk.opticmarkdown2.LensRef
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

import scala.util.hashing.MurmurHash3

case class CompiledMultiNodeLens(name: Option[String],
                                 id: String,
                                 packageRef: PackageRef,
                                 schema: Either[SchemaRef, OMSchema],
                                 enterOn: Set[AstType],
                                 parserRef: ParserRef,
                                 childLenses: Seq[CompiledLens]
                                ) extends SGExportableLens {

  require(childLenses.size > 1, "Multi Node Lenses must have at least 2 child lenses defined")

  override def lensRef: LensRef = LensRef(Some(packageRef), id)

  lazy val hash: String = {
    val int: Int = {
      MurmurHash3.stringHash(name.getOrElse("NONE")) ^
        MurmurHash3.stringHash(id) ^
        MurmurHash3.stringHash(packageRef.full) ^
        MurmurHash3.stringHash(schema.toString) ^
        MurmurHash3.setHash(enterOn) ^
        MurmurHash3.stringHash(childLenses.map(_.hash).mkString)
    }

    Integer.toHexString(int)
  }

  def sourceSourceParser = SourceParserManager.parserById(parserRef).getOrElse(throw new Error("Unable to find parser for generator"))

  val parser = new MultiNodeParseGear(childLenses, enterOn, lensRef, schemaRef)
  val renderer = new MultiNodeRenderGear(childLenses, sourceSourceParser)
  val internal: Boolean = false

  override def variableManager: VariableManager = childLenses.head.variableManager

  override def schemaRef: SchemaRef = {
    if (schema.isLeft) {
      schema.left.get
    } else {
      schema.right.get.schemaRef
    }
  }

}
