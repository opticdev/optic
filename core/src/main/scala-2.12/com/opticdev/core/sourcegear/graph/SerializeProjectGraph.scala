package com.opticdev.core.sourcegear.graph

import com.opticdev.common.SchemaRef
import com.opticdev.common.SchemaRef._
import com.opticdev.core.sourcegear.graph.edges.InProject
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.sourcegear.graph.projects.ProjectNode
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.snapshot.Snapshot
import play.api.libs.json.{JsArray, JsObject, Json}
import scalax.collection.mutable.Graph
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


object SerializeProjectGraph {

  implicit val savedObjectFormats = Json.format[SavedObject]

  case class SavedObject(name: String, expandedValue: JsObject, schema: SchemaRef)

  implicit class SavedObjectJsonWrapper(set: Set[SavedObject]) {
    def toJson = JsArray(set.map(i=> Json.toJson(i)).toSeq)
  }
  /* test me... */

  def fromProject(project: ProjectBase): Future[Set[SavedObject]] = {
    Snapshot.forProject(project).map(snapshot=> {
      snapshot.linkedModelNodes.keys.collect {
        case mn if mn.objectRef.isDefined => {
          val expandedValue = snapshot.expandedValues(mn)
          SavedObject(mn.objectRef.get.name, expandedValue, mn.schemaId)
        }
      }.toSet
    })
  }

  def loadProjectGraphFor(projectName: String) : Option[ProjectGraph] = ???

  def projectGraphFrom(set: Set[SavedObject], projectName: String): ProjectGraph = {

    val allObjects = set.map(saved => ObjectNode(s"${projectName}: "+projectName, saved.schema, saved.expandedValue))

    val projectNode = ProjectNode(projectName, null, new java.util.Date())

    val projectGraph : ProjectGraph = Graph()
    projectGraph.add(projectNode)

    allObjects.foreach(obj => projectGraph add (projectNode ~+#> obj) (InProject()))

    projectGraph
  }

}
