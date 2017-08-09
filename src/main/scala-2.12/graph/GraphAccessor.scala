package graph

import cognitro.core.contributions.ChangeAccumulator
import cognitro.parsers.GraphUtils._
import play.api.libs.json.JsValue

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object GraphAccessor {

  implicit class GraphAccessorMethods(val subGraph: Graph[BaseNode, LkDiEdge]) {

    private implicit val graph = subGraph

    def nodeType(nodeType: AstType) : Vector[AstNodeWrapper] = {
      val found: Vector[subGraph.NodeT]= subGraph.nodes.filter((x: BaseNode) => x.isASTType(nodeType)).toVector

      found.map(i=> {
        AstNodeWrapper(i.value.asInstanceOf[AstPrimitiveNode])
      })
    }

    def modelType(modelType: ModelType) : Vector[ModelNode] = {
      val found: Vector[subGraph.NodeT]= subGraph.nodes.filter((x: BaseNode) => x.isModelType(modelType)).toVector
      found.map(_.value.asInstanceOf[ModelNode])
    }

    def nodeTypeRaw(nodeType: AstType) : Vector[AstPrimitiveNode] = {
      val found: Vector[subGraph.NodeT]= subGraph.nodes.filter((x: BaseNode) => x.isASTType(nodeType)).toVector

      found.map(i=> {
        i.value.asInstanceOf[AstPrimitiveNode]
      })
    }

    def nodeByHash(hash: Int) : Option[BaseNode] = subGraph.nodes.find((x: BaseNode)=> {
      x.hashCode() == hash
    }).map(_.value)


    def insightModels : Vector[InsightModelNode] =
      subGraph.nodes.filter(x =>
        x.value.isInstanceOf[ModelNode])
        .map(_.value).toVector.asInstanceOf[Vector[InsightModelNode]]

    def fileNode(filePath: String) : Option[FileNodeWrapper] = {
      val found = subGraph.nodes.find((x: BaseNode) => {
        x.isFileNode && x.asInstanceOf[FileNode].filePath == filePath
      })

      if (found.isDefined) {
        Option(FileNodeWrapper(found.get.value.asInstanceOf[FileNode]))
      } else None

    }

    def updateModel(node: BaseNode, newValue: JsValue) : Boolean = {

      val changeAcumulator = new ChangeAccumulator()

      //ok if this throws an exception because of Akka
      val foundNode = subGraph.get(node).value.asInstanceOf[BaseNode]
      val allDependencies: Map[String, AstNodeWrapper] = foundNode.labeledDependencies(subGraph).filter(_._1.isInstanceOf[Produces]).map(i=> {
        val produces = i._1.asInstanceOf[Produces]
        (produces.label, AstNodeWrapper(i._2.asInstanceOf[AstPrimitiveNode], changeAcumulator))
      }).toMap

      node match {
        case imn:InsightModelNode => imn.insight.write(newValue, allDependencies)
        case ast: AstPrimitiveNode => {
          val nodeWrapper = AstNodeWrapper(ast, changeAcumulator)
          nodeWrapper.node.updateValue(nodeWrapper, newValue)
        }
      }
      //@todo fix this with real errors
      if (changeAcumulator.hasChanges) {
        changeAcumulator.output
        true
      } else {
        false
      }
    }


  }

}
