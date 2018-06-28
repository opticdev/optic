package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.core.sourcegear.gears.helpers.ChildrenVectorComparison
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.common.SchemaRef
import com.opticdev.core.utils.VectorDistinctBy._
import com.opticdev.sdk.opticmarkdown2.LensRef

import scala.collection.immutable

class MultiNodeParseGear(childLenses: Seq[CompiledLens], enterOn: Set[AstType], lensRef: LensRef, schemaRef: SchemaRef) {

  private val childSchemas = childLenses.map(_.schemaRef).toVector

  def variableManager = childLenses.head.variableManager

  def findMatches(implicit astGraph: AstGraph): Set[MultiNodeMatchResults] = {

    val foundNodes = astGraph.nodes.collect {
      case mn if mn.value.isInstanceOf[ModelNode] && childSchemas.contains(mn.value.asInstanceOf[ModelNode].schemaId)
        => mn.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph)
    }

    val groupedByParent = foundNodes
      .filter(n=> n.root.parent.isDefined && enterOn.contains(n.root.parent.get.nodeType))
      .groupBy(_.root.parent.get)


    def defaultEquality(a: SchemaRef, b: SchemaRef) = MatchResults(a == b)

    groupedByParent.flatMap {
      case (parent, foundTargets) => {

        val maximumMatches = foundTargets.groupBy(_.schemaId).mapValues(_.size).minBy(_._2)._2

        val sorted = foundTargets.toVector.sortBy(_.root.range.end)

        val childrenIndicies = sorted.zipWithIndex.collect{ case n if n._1.schemaId == childSchemas.last => n._2 }

        val split = sorted.zipWithIndex.groupBy {
          case (node, index) => childrenIndicies.lastIndexWhere(lastIndex => lastIndex < index)
        }.toSeq.sortBy(_._1).map(_._2.map(_._1))

        split.map(seq=> {

          val distinctSeq = distinctBy(seq)((i)=> i.schemaId)

          val sortedSchemas = distinctSeq.map(_.schemaId)

          val matchResults = ChildrenVectorComparison.samePlus[SchemaRef, SchemaRef](sortedSchemas, childSchemas, defaultEquality)

          MultiNodeMatchResults(matchResults.isMatch, schemaRef, lensRef, parent, distinctSeq.map(_.flatten), this)
        })
      }
    }.filter(_.isMatch)
     .toSet
  }

}
