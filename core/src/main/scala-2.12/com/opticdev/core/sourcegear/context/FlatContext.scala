package com.opticdev.core.sourcegear.context

import com.opticdev.common.{PackageRef, SGExportable}
import com.opticdev.core.sourcegear.{CompiledLens, SGConfig, SGExportableLens, SourceGear}
import com.opticdev.opm.context.Tree
import com.opticdev.sdk.skills_sdk.schema.OMSchema

import scala.util.Try

/**
  * A simplified tree we can save/recall within sourcegear instances. Maps paths to actual SGExportable nodes
  */

sealed trait FlatContextBase {
  def resolve(string: String) : Option[SGExportable]
  def prefix(prefix: String) : FlatContextBase = PrefixedFlatContent(prefix, this)
}

case class FlatContext(packageRef: Option[PackageRef], mapping: Map[String, SGExportable]) extends SGExportable with FlatContextBase {
  def resolve(string: String) : Option[SGExportable] = {
    val path = string.split("\\/+").filterNot(_.isEmpty)

    Try(path.foldLeft(None: Option[SGExportable]) {
      case (opt, comp) => {
        if (opt.isDefined) {
          opt.get match {
            case context: FlatContext => Some(context.mapping(comp))
            case _ => throw new Exception(s"'${comp}' is not a valid path for ${opt.get}")
          }
        } else {
          //first run
          mapping.get(comp)
        }
      }
    }).toOption.flatten

  }
}

case class PrefixedFlatContent(prefix: String, flatContext: FlatContextBase) extends FlatContextBase {
  override def resolve(string: String): Option[SGExportable] = {
    flatContext.resolve(s"${prefix}/${string}")
  }
}

object FlatContextBuilder {
  def fromDependencyTree(dependencyTree: Tree, packageRef: Option[PackageRef] = None)(implicit schemas: Set[OMSchema], compiledLenses: Set[SGExportableLens]) : FlatContext = {

    val includedSchemas: Set[(String, OMSchema)] = schemas.collect {
      case s: OMSchema if s.schemaRef.packageRef.contains(packageRef.getOrElse(None)) =>
        (s.schemaRef.id, s)
    }
    val includedLenses: Set[(String, CompiledLens)] = compiledLenses.collect {
      case l: CompiledLens if packageRef.contains(l.packageRef) =>
        (l.id, l)
    }

    val exportables = includedLenses ++ includedSchemas

    FlatContext(packageRef, (dependencyTree.leafs.map(i => {
      (i.opticPackage.packageId, fromDependencyTree(i.tree, Some(i.opticPackage.packageRef)))
    }) ++ exportables).toMap)
  }

  def empty = FlatContext(None, Map.empty)

}