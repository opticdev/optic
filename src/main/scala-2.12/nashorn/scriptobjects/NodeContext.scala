package nashorn.scriptobjects

import cognitro.parsers.GraphUtils.BaseFileNode
import graph.FileNodeWrapper
import jdk.nashorn.api.scripting.JSObject
import nashorn.ScriptObjectUtils

case class NodeContext(fileNode: BaseFileNode) {

  lazy val asJs: JSObject = {
    val newObject = ScriptObjectUtils.objConstructor.newObject().asInstanceOf[JSObject]

    //@todo make this a JS wrapped node for safety.
    newObject.setMember("file", fileNode)

    newObject
  }

}
