package com.opticdev.core.sourcegear.sync

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper, SyncGraph}
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}

import com.opticdev.common.graph.BaseNode
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.constrained._
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.snapshot.Snapshot
import play.api.libs.json.JsObject
import scalax.collection.GraphPredef
import scalax.collection.constrained.constraints.Acyclic
import scalax.collection.constrained.mutable.Graph

import scala.collection.mutable
// import scalax.collection.constrained.constraints.Acyclic

import scala.util.Try

//only call from a project actor

/*
Invalid States:
1. Multiple models with the same name -> None work, warnings generated
2. Sources that don't connect to a valid model name -> no edges, warnings generated
3. Circular dependencies -> no edges, warnings generated

 */

object SyncGraph {

  trait NamedSyncGraphNode extends AstProjection {
    def name: Option[String]
    def schema: SchemaRef
    def node: BaseNode
  }
  case class NamedModelNode(modelNode: BaseModelNode) extends NamedSyncGraphNode {
    override def isModel: Boolean = true
    def name = modelNode.objectRef.map(_.name)
    def schema: SchemaRef = modelNode.schemaId
    def node: BaseNode = modelNode
  }
  case class NamedObjectNode(objectNode: ObjectNode) extends NamedSyncGraphNode {
    override def isObject: Boolean = true
    def schema: SchemaRef = objectNode.schemaRef
    def name = Some(objectNode.name)
    def node: BaseNode = objectNode
  }

  def emptySyncGraph: SyncGraph = {
    implicit val conf: Config = Acyclic
    Graph()
  }

  def syncGraphFromProjectGraph(pg: ProjectGraph) = pg.filter(pg.having(edge = (e) => e.isLabeled && e.label.isInstanceOf[DerivedFrom]))

  def getSyncGraph(snapshot: Snapshot) : SyncSubGraph = {
    val projectGraph = snapshot.projectGraph
    val syncSubgraph = emptySyncGraph
    val warnings = scala.collection.mutable.ListBuffer[() => SyncWarning]()
    var validTargets = 0

    def hasName(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].objectRef.isDefined
    def hasSource(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].sourceAnnotation.isDefined

    val pgDefinesNames: mutable.Set[BaseModelNode] = projectGraph.nodes.collect { case i if hasName(i) && !i.value.asInstanceOf[BaseModelNode].internal => i.value.asInstanceOf[BaseModelNode]}
    val pgDefinesSources: mutable.Set[BaseModelNode] = projectGraph.nodes.collect { case i if hasSource(i) && !i.value.asInstanceOf[BaseModelNode].internal => i.value.asInstanceOf[BaseModelNode]}

    val allObjects = projectGraph.nodes.collect {case obj if obj.isObject => NamedObjectNode(obj.value.asInstanceOf[ObjectNode])}

    val allNames: mutable.Set[NamedModelNode] = {
      val an = pgDefinesNames.map(i=> NamedModelNode(i))
      val duplicates = an.groupBy(_.name).filter(_._2.size > 1).keys
      duplicates.foreach(dup=> warnings += {
        () => DuplicateSourceName(dup.get, Try(an.map(mn=> snapshot.linkedModelNodes(mn.modelNode.flatten).toDebugLocation).toVector).getOrElse(Vector()))
      })
      an.filterNot(name => duplicates.exists(_ == name))
    }

    import com.opticdev.core.utils.VectorDistinctBy._
    val combined = distinctBy(allObjects.toVector ++ allNames.toVector)(i=> i.name)

    val unifiedTargets = pgDefinesSources
    unifiedTargets
    .foreach(targetNode=> {
      val sourceAnnotation = targetNode.sourceAnnotation.get
      val sourceName = sourceAnnotation.sourceName
      val sourceNodeOption = combined.find(_.name.contains(sourceName))

      if (sourceNodeOption.isDefined) {
        validTargets += 1
        val didAdd = syncSubgraph add (sourceNodeOption.get ~+#> NamedModelNode(targetNode))(DerivedFrom(sourceAnnotation.transformationRef, sourceAnnotation.askObject.getOrElse(JsObject.empty)))
        if (!didAdd) {
          warnings += {
            () => CircularDependency(sourceName, snapshot.linkedModelNodes(targetNode.flatten).toDebugLocation)
          }
        }
      } else {
        warnings += {
          () => SourceDoesNotExist(sourceName, snapshot.linkedModelNodes(targetNode.flatten).toDebugLocation)
        }
      }
    })

    SyncSubGraph(combined.toSet.size, validTargets, warnings.map(_.apply()).toVector, projectGraph ++ syncSubgraph)
  }

}
