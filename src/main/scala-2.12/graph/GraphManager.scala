package graph
import cognitro.parsers.GraphUtils._
import cognitro.parsers.Utils.Crypto
import graph.GraphAccessor._
import nashorn.scriptobjects.ParserReturn
import nashorn.scriptobjects.accumulators.AccumulatorParserReturn
import nashorn.scriptobjects.insights.InsightParserReturn
import providers.Provider

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class GraphManager (implicit val provider: Provider) {

  private implicit var graph : Graph[BaseNode, LkDiEdge] = Graph().asInstanceOf[Graph[BaseNode, LkDiEdge]]

  def getGraph = graph

  def graphSize = (graph.nodes.size, graph.edges.size)

  def clearMasterGraph = {
    graph = Graph().asInstanceOf[Graph[BaseNode, LkDiEdge]]
  }

  def addParsedFileToGraph(parsedFile: ParsedFile) = {
    //much more efficient esp for big graphs
    graph ++= parsedFile.graph
  }

  def addParsedGraph(parsedGraph: Graph[BaseNode, LkDiEdge]) = {
    //much more efficient esp for big graphs
    graph ++= parsedGraph
  }

  def removeFileNodeFromGraph(fileNode: FileNodeWrapper) = {
    val allAstNodes = fileNode.astNodes
    val allModelNodes = fileNode.astNodes.flatMap(_.models(true))

    val toDelete: Vector[NodeWrapper] = allAstNodes ++ allModelNodes :+ fileNode

    toDelete.map(_.node).foreach(node=> {
      graph -= node
    })
  }

  def updateParsedFileInGraph(oldFileNode: FileNodeWrapper, newParsedFile: ParsedFile) = {
    removeFileNodeFromGraph(oldFileNode)
    addParsedFileToGraph(newParsedFile)
  }

  def reportOut(currentGeneration: Int, newNodes: Set[BaseNode]) = {
    println("Processing Graph at Level "+currentGeneration+". Found "+newNodes.size+" new models.")
  }

  //@todo try out parallel vector walking at some point. For each level of abstraction there should be no side effects -- should be safe/useful.
  def interpretGraph(initialSubgraph: Graph[BaseNode, LkDiEdge] = graph): Unit = {
    //arbitrary for now
    val maxGenerations = 10
    var currentGeneration : Int = 0
    var finished = false
    //start at the top
    var subgraph = initialSubgraph
    //start it off at generation 0
    while (currentGeneration<maxGenerations && !finished) {
      val newNodes = nextGeneration(subgraph)
      if (newNodes.size == 0) {
        finished = true
      } else {

        val nodesInGraph: Set[BaseNode] = newNodes.map((node: ParserReturn) => {

          node match {
            case insightNode: InsightParserReturn=> {
              val dependencies: Map[String, AstPrimitiveNode] = insightNode.dependencies
              val dependencyHash = DependencyHash.insightHash(dependencies)

              val value = insightNode.model.value

              val insightModelNode = InsightModelNode(insightNode.model.definition.identifier, value, insightNode.insight, dependencyHash)

              val inGraph = graph.add(insightModelNode)
              //add everything to the graph including dependency edges
              dependencies.foreach(bn => {
                graph.add( (bn._2 ~+#> insightModelNode) (Produces(bn._1)))
              })

              insightModelNode
            }
            case accumulatorNode: AccumulatorParserReturn => {

              val dependencies = accumulatorNode.dependencies
              val dependencyHash = DependencyHash.accumulatorHash(dependencies)

              val accumulatorModelNode =
                AccumulatorModelNode(accumulatorNode.model.nodeType,
                                   accumulatorNode.model,
                                   accumulatorNode.accumulator,
                                   dependencyHash)

              val inGraph = graph.add(accumulatorModelNode)

              dependencies.foreach(n => {
                graph.add( (n ~+#> accumulatorModelNode) (Produces()))
              })

              accumulatorModelNode
            }
          }

        })

        //only evaluate new items from now on //this probably won't scale if we have multiple entry points
        subgraph = graph filter graph.having(node => {
          nodesInGraph.contains( node.value )
        })


        reportOut(currentGeneration, nodesInGraph)
      }

      if (newNodes.size == 0) {
        reportOut(currentGeneration, Set())
      }

      //add the new models to the graph
      currentGeneration += 1
    }

  }

  private def nextGeneration(subgraph: Graph[BaseNode, LkDiEdge]): Set[ParserReturn] = {

    val derivedModels: Set[InsightParserReturn] = provider.insightProvider.entryMap.flatMap(i=> {

      val astType = i._1
      val entryNodes = subgraph.nodeType(astType)

      //run each entry node through each valid insight
      val insightDerivedModels: Set[InsightParserReturn] = i._2
        .flatMap(insight=> entryNodes
                            .flatMap( node => insight.evaluateNode(node) ) )

      insightDerivedModels
    }).toSet

    //run the accumulators once per generation.
    val accumulatorModels : Set[AccumulatorParserReturn] = provider.accumulatorProvider.allAccumulators.flatMap(accumulator=> {
      accumulator.evaluate(subgraph)
    }).toSet

    (derivedModels ++ accumulatorModels).filterNot(_ == null).asInstanceOf[Set[ParserReturn]]

  }

}

object DependencyHash {
  def accumulatorHash(dependencies: Set[BaseNode]) = {
    val depString = dependencies.zipWithIndex.map {
      case (node, index) => {
        val modelNode = node.asInstanceOf[ModelNode]
        modelNode + " " + index
      }
    }.mkString("\n")
    Crypto.createSha1(depString)
  }

  def insightHash(dependencies: Map[String, AstPrimitiveNode] = Map()) = {
    val depString = dependencies.map {
      case (edgeType, node) => astNodeToHashString(edgeType, node)
    }.mkString("\n")
    Crypto.createSha1(depString)
  }

  private def astNodeToHashString(edgeType: String, astPrimitiveNode: AstPrimitiveNode) = {
    edgeType + " " + astPrimitiveNode.fileHash + astPrimitiveNode.range
  }

}