package compiler

import cognitro.core.components.models.ModelInstance
import cognitro.parsers.GraphUtils._
import cognitro.parsers.GraphUtils.Path.{PropertyPathWalker, WalkablePath}
import lensparser.FinderEvaluator
import nashorn.scriptobjects.{ComponentImpl, GroupImpl, Groupable, LensImpl}
import sourceparsers.SourceParserManager
import utils.TupleToMap._

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


object Compiler {

  def compile(groupImpl: GroupImpl): Unit /* AccumulatorWriter */ = {


    //first we need to generate lenses for those groupables
    val childLensesCompiled = groupImpl.allGroupables.filter(_.isLens).map(l=> compile(l.asInstanceOf[LensImpl]))


    //then we need to extract the accumulator collect targets.
    val lenses = childLensesCompiled
        .map(i=> (i.lensImpl.modelDefinition.identifier, i.lensImpl))
            .toMapWithSetValue
              .asInstanceOf[Map[ModelType, Set[Groupable]]]

    val models = groupImpl.allGroupables
        .filter(_.isModel)
          .map(i=> (i.asInstanceOf[ModelInstance].definition.identifier, i))
            .toMapWithSetValue
              .asInstanceOf[Map[ModelType, Set[Groupable]]]


    val accumulatorCollect: Map[ModelType, Set[Groupable]] = lenses.concat(models)

    new AccumulatorParserGenerator(accumulatorCollect)

  }

  def compile(lensImpl: LensImpl): InsightWriter = {

    var enterOn : AstType = null
    var entryChild : AstPrimitiveNode = null

    val sourceRootType = SourceParserManager.programNodeTypeForLanguage(lensImpl.template.description.language).get
    val baseNodeType   = lensImpl.template.rootNode.nodeType
    if (baseNodeType == sourceRootType) {
      val children = lensImpl.template.rootNode.getChildren(lensImpl.template.graph)

      val allNodeTypes = children.map(_._2.nodeType).distinct
      if (allNodeTypes.size != 1) {
        throw new Error("Ambiguous entry node in example '"+lensImpl.template.description.name+"'")
      } else {
        enterOn = allNodeTypes.head
        entryChild = children.head._2
      }

    } else {
      throw new Error("Base node in example '"+lensImpl.template.description.name+"' must be the language's program node. In this case "+baseNodeType+" was not "+ sourceRootType)
    }



    val parserGenerator = new LensParserGenerator(lensImpl, componentsWithPaths(lensImpl), entryChild, lensImpl.template.graph)


//    println(parserGenerator.generate)
    InsightWriter(parserGenerator, lensImpl, enterOn)

  }

  def componentsWithPaths(lensImpl: LensImpl) : Vector[ComponentsWithPaths] = {
    lensImpl.allComponents.map(component=> {

      if (!component.componentAccessorManager.isValid) {
        throw new Error("Component invalid as described. Requires both a set and a get accessor")
      }

      println(component)

      val path = getPath(lensImpl, component)

      val relativePath = getPathRelative(lensImpl, path)


      if (path == null || path._1.isEmpty) {
        throw new Error("No path found for component with "+component.finder)
      }

      //validate property paths
      val propertyPathWalker = new PropertyPathWalker(path._1.get)
      val get = component.componentAccessorManager.accessors._1
      val hasGet = propertyPathWalker.hasProperty(get.jsValue)
      val set = component.componentAccessorManager.accessors._2
      val hasSet = propertyPathWalker.hasProperty(set.jsValue)

      if (!hasSet || !hasGet) {
        val error : String = {
          var e = ""
          if (!hasGet) {
            e = get.toString+" "
          }
          if (!hasSet) {
            e += set.toString
          }
          e
        }
        throw new Error("Invalid properties path "+ error)
      }

      val walkablePath = relativePath._2

      ComponentsWithPaths(component, walkablePath)

    })
  }

  case class ComponentsWithPaths(component: ComponentImpl, walkablePath: WalkablePath) {
    lazy val jsCode : String =  JsUtils.doubleQuotes( ( Vector("node") ++ walkablePath.childPath.map(childPathJSString) ).mkString("."))
  }

  def getPathRelative(lensImpl: LensImpl, path: (Option[AstPrimitiveNode], Option[WalkablePath], (Graph[BaseNode, LkDiEdge], AstPrimitiveNode))) : (NodeType, WalkablePath) = {
    val programNode = SourceParserManager.programNodeTypeForLanguage(lensImpl.template.description.language)

    val walkablePath = path._2.get

    if (walkablePath.childPath.size<1) {
      throw new Error("Example code is empty")
    }

    val firstStep = walkablePath.childPath.head

    val firstStepPath = WalkablePath(walkablePath.rootNode, Vector(firstStep), walkablePath.graph)

    val firstStepEvaluated = firstStepPath.walk(lensImpl.template.rootNode, lensImpl.template.graph)

    (firstStepEvaluated.nodeType, WalkablePath(walkablePath.rootNode, walkablePath.childPath.slice(1, walkablePath.childPath.size), walkablePath.graph))

  }

  private def getPath(lensImpl: LensImpl, componentImpl: ComponentImpl) = {
    FinderEvaluator.findWithPath(lensImpl.template.contents,
      lensImpl.template.graph,
      lensImpl.template.rootNode,
      componentImpl.finder)
  }

  private def childPathJSString(child: Child) = "dependents("+JsUtils.doubleQuotes(child.typ)+")["+child.index+"]"

  case class InsightWriter(parserGenerator: LensParserGenerator, lensImpl: LensImpl, enterOn: AstType) extends ParserGeneratorNode {
    override def jsCode : String = ""
  }
}
