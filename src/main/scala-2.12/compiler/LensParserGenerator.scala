package compiler

import cognitro.core.components.models.ModelDefinition
import cognitro.parsers.GraphUtils.Path.{PathFinder, PropertyPathWalker, WalkablePath}
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, Child}
import compiler.JsUtils._
import compiler.Compiler.ComponentsWithPaths
import nashorn.scriptobjects._
import play.api.libs.json.{JsObject, JsString}
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class LensParserGenerator(lensImpl: LensImpl, components: Vector[ComponentsWithPaths], templateNode: AstPrimitiveNode, implicit private val graph: Graph[BaseNode, LkDiEdge]) {

  val nodeStub = NodeStub(0)

  private implicit var rules : Vector[Rules] = Vector()
  def addRule(rule: Rules) = rules = rules :+ rule

  private implicit var extraCode : Map[WalkablePath, Vector[StubBodyParserGeneratorNode]] = Map()
  def addCode(target: WalkablePath, parserGeneratorNode: StubBodyParserGeneratorNode) = {
    val entryOption = extraCode.get(target)
    if (entryOption.isDefined) {
      val newVec = entryOption.get :+ parserGeneratorNode
      extraCode = extraCode + (target -> newVec)
    } else extraCode = extraCode + (target -> Vector(parserGeneratorNode))
  }

  private implicit var getters : Vector[ComponentAccessorWithPath] = Vector()
  def addGetter(getter: ComponentAccessorWithPath) = getters = getters :+ getter


  val identifierNodeDesc = {
    val ind = SourceParserManager.IdentifierNodeTypeForLanguage(lensImpl.template.description.language)
    if (ind.isDefined) ind.get else throw new Error("Identifier Node not defined for "+lensImpl.template.description.language)
  }

  //create rules for all variables we define.
  lensImpl.allVariables.foreach(variable => {

    val name = variable.name

    val foundNodes = graph.nodes.filter(i=> {
      i.value.isAstNode() && {
        val node = i.value.asInstanceOf[AstPrimitiveNode]
        val propertyPathWalker = new PropertyPathWalker(node)

        node.nodeType == identifierNodeDesc.nodeType &&
          propertyPathWalker.getProperty(identifierNodeDesc.path).get == JsString(name)
      }
    }).map(_.value.asInstanceOf[AstPrimitiveNode]).toVector.sortBy(i=> i.range._1)

    if (foundNodes.size > 0) {
      val firstPath = PathFinder.getPath(graph, lensImpl.template.rootNode, foundNodes.head)
      val firstRelativePath = Compiler.getPathRelative(lensImpl, (Option(foundNodes.head), firstPath, (graph, templateNode)))._2
      //work with all other variables
      foundNodes.slice(1, foundNodes.length).foreach(variableNode=> {
        val relativePath = PathFinder.getPath(graph, templateNode, variableNode).get
//        val relativePath = LensCompiler.getPathRelative(lensImpl, (Option(foundNodes.head), path, (graph, templateNode)))._2
        addRule(PropertyRule(relativePath, identifierNodeDesc.path, SharedValue(name)))
      })

      //return first one
      addRule(PropertyRule(firstRelativePath, identifierNodeDesc.path, SharedValue(name)))
    }

  })

  //create accessors and rules for all components defined
  components.foreach(com=> {
    val get = com.component.componentAccessorManager.accessors._1
    addRule(PropertyRule(com.walkablePath, get.path, AnyValue()))
    addGetter(ComponentAccessorWithPath(get, com.walkablePath))
  })

  val main = LensParserMain()
  main.addChild(ModelDeclaration(lensImpl.modelDefinition))


  val nodeCompare = NodeCompare(nodeStub, templateNode)

  main.addChild(nodeCompare)

  main.addChild(ReturnModel())

  def generate : String = main.jsCode

}

sealed trait StubBodyParserGeneratorNode extends ParserGeneratorNode {
  var stub : String
}

case class LensParserMain() extends ParserGeneratorNode {
  override def jsCode: String = "function (a0, Shared) { \n"+
  getChildren.map(_.jsCode).mkString("\n") +
  "\n}"
}

case class NodeCompare(stub: NodeStub,
                       template: AstPrimitiveNode,
                       currentPath: Vector[Child] = Vector())
                      (implicit val graph: Graph[BaseNode, LkDiEdge],
                       implicit val rules: Vector[Rules],
                       implicit val getters: Vector[ComponentAccessorWithPath],
                       implicit var extraCode : Map[WalkablePath, Vector[StubBodyParserGeneratorNode]])
                                                                                extends ParserGeneratorNode {

  case class TypeComparision() extends ParserGeneratorNode {
    override def jsCode: String = dot(stub.name, "type")+" === "+doubleQuotes(template.nodeType.name)
  }

  case class PropertiesComparision() extends ParserGeneratorNode {
    override def jsCode: String = {

      val nodeRules = rules.filter(i=> {
          i.isInstanceOf[PropertyRule] &&
          i.asInstanceOf[PropertyRule].walkablePath.childPath == currentPath
      }).asInstanceOf[Vector[PropertyRule]]

      val propertiesObject = template.properties.as[JsObject].value
      val properties = propertiesObject.map(prop=> {

        val overrideRule = nodeRules.find(_.propertyPath == prop._1)

        if (overrideRule.isDefined) {
          overrideRule.get.jsCode(stub, prop._2)
        } else {
          dot(stub.name, "properties", prop._1)+" === "+ jsValueAsJsString(prop._2)
        }
      }).filterNot(_ == null).mkString(" && ")

      if (propertiesObject.size == 0 || properties == "") null else "( "+properties+" )"
    }
  }

  case class ChildrenComparision() extends ParserGeneratorNode {

    val children = template.getChildren(graph).map(child=> {
      val childStub = stub.nextName
      val edge = child._1.asInstanceOf[Child]
      val declare = "var "+childStub.name+" = "+ dot(stub.name, edge.typ)+"["+edge.index+"]"
      val compare = NodeCompare(childStub, child._2, currentPath :+ edge )
      (declare, compare)
    })

    override def jsCode: String = "\n" +
      children.map(child=> {
        child._1 + "\n" + child._2.jsCode
      }).mkString("\n") + "\n"

  }

  case class ExtraCode() extends ParserGeneratorNode {
    override def jsCode: String = {

      val nodeExtraCode = extraCode.filter(i=> {
        i._1.childPath == currentPath
      }).flatMap(_._2).map(i=> {
        i.stub = stub.name
        i
      }).toSeq

      CombineGenerators(nodeExtraCode:_*).jsCode
    }
  }

  case class ModelSet() extends ParserGeneratorNode {
    override def jsCode: String = {
      //only give me getters for this node
      val nodeGetters = getters.filter(_.walkablePath.childPath == currentPath)

      nodeGetters.map(getter => {
        val values = getter.componentAccessor match {
          case d: DualAccessor => (d.field, d.path)
          case g: GetAccessor =>  (g.field, g.path)
        }

        dot("model", values._1)+" = "+dot(stub.name, "properties", values._2)
      }).mkString("\n")
    }
  }

  override def jsCode : String = ifStatement(
    Vector(TypeComparision(),
      PropertiesComparision()),
        CombineGenerators(ExtraCode(), ModelSet(), ChildrenComparision()),
          ReturnNull())
}


case class CombineGenerators(parserGeneratorNode: ParserGeneratorNode*) extends ParserGeneratorNode {
  override def jsCode: String = parserGeneratorNode.map(_.jsCode).mkString("\n")
}

case class Empty() extends ParserGeneratorNode {
  override def jsCode: String = ""
}

case class ModelDeclaration(modelDefinition: ModelDefinition) extends ParserGeneratorNode {
  override def jsCode: String = {

    if (modelDefinition.identifier.name == "EMPTY") {
      "var model = {} \n" +
      "var success = true \n" +
        "var modelDefinition = Model.empty() \n"
    } else {
      val identifier = doubleQuotes(modelDefinition.identifier.name)
      "var model = {} \n" +
      "var success = true \n" +
        "var modelDefinition = Model.load("+identifier+") \n"
    }

  }
}

case class ReturnNull() extends ParserGeneratorNode {
  override def jsCode: String = "success = false \n " +
    "return null \n"
}

case class ReturnModel() extends ParserGeneratorNode {
  override def jsCode: String = {

      "if (success) { \n"+
      " return [{ \n"+
        "  model: modelDefinition.instanceOf(model), \n"+
        "  dependencies: { variable: a0} \n"+
      " }] \n"+
    "} else { return null }"
  }
}

case class VariableFirst(variable: Variable, path: String, variableNameInCode: String) extends StubBodyParserGeneratorNode {
  override var stub : String = null
  override def jsCode: String = {
    "var "+variableNameInCode+" = "+ dot(stub, "properties", path)
  }
}