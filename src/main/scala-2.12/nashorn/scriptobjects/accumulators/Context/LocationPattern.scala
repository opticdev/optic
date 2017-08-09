package nashorn.scriptobjects.accumulators.Context

import cognitro.parsers.GraphUtils._
import cognitro.parsers.GraphUtils.Path.PropertyPathWalker
import nashorn.scriptobjects.accumulators.Context.LocationPattern.LocationGroupEnum
import nashorn.scriptobjects.models.{ValuePattern, _}
import play.api.libs.json.{JsArray, JsNull, _}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class LocationPattern(locationRules: LocationRule*) {
  def evaluate(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope) : Boolean = {
    locationRules.foldLeft(true){
      case (b, i)=> i.evaluate(baseNode)
    }
  }
}

object LocationPattern {

  object LocationGroupEnum extends Enumeration {
    val FILE = Value
  }

  def fromJs(jsValue: JsValue) : LocationPattern = {

    val results = jsValue match {
      case a: JsArray => a.value.map(ruleMatchFromJs)
      case a:JsString => Seq(ruleMatchFromJs(a))
      case null => Seq()
      case JsNull => Seq()
      case a:JsNumber => Seq()
      case JsTrue => Seq()
      case JsFalse => Seq()
    }

    LocationPattern(results:_*)

  }

  def default: LocationPattern = LocationPattern(CurrentFile())

  def ruleMatchFromJs(jsValue: JsValue) : LocationRule = {
    jsValue match {
      //basic matching
      case n: JsString => {
        if (n.value.matches("^\\[[a-zA-Z]*]")) {
          SharedFile(n.value.substring(1, n.value.length-1))
        } else {
          FileLocation(InPath(n.value))
        }
      }
        //@todo no need for these as of yet
      case _ => null
    }
  }
}



sealed trait LocationRule {
  def evaluate(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope) : Boolean
  def getFileNode(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope) : BaseFileNode = {
    baseNode match {
      case ast:AstPrimitiveNode => ast.fileNode(graph)
      case file: FileNode => file
      case _ => null
    }
  }

  val groupType : LocationGroupEnum.Value
}


sealed trait FileRule

case class InFile(fileNode: FileNode) extends FileRule
case class InPath(filePath: String) extends FileRule
case class FileLocation(fileRule: FileRule) extends LocationRule {
  override def evaluate(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope): Boolean = {
    val fN = getFileNode(baseNode)
    fileRule match {
      case InFile(fileNode)=> fileNode == fN
      case InPath(filePath)=> filePath == fN.filePath
      case null => false
    }
  }
  override val groupType = LocationGroupEnum.FILE
}

case class SharedFile(name: String) extends LocationRule {
  override def evaluate(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope): Boolean = {
    val fN = getFileNode(baseNode)
    bundleScope.sharedFiles.value(name, fN)
  }
  override val groupType = LocationGroupEnum.FILE
}


//meta
case class CurrentFile() extends LocationRule {
  override def evaluate(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge], bundleScope: BundleScope): Boolean = {
    val fN = getFileNode(baseNode)
    bundleScope.currentFile(fN)
  }
  override val groupType = LocationGroupEnum.FILE
}