package nashorn.scriptobjects

import cognitro.parsers.GraphUtils.Path.WalkablePath
import compiler.JsUtils
import jdk.nashorn.api.scripting.ScriptObjectMirror

sealed trait ComponentAccessor {
  lazy val jsValue : String = ""
  val field : String
  val path : String
}
sealed trait GetAccessor extends ComponentAccessor
sealed trait SetAccessor extends ComponentAccessor
sealed trait DualAccessor extends ComponentAccessor

case class Get(path: String, field: String) extends GetAccessor {
  override lazy val jsValue: String = JsUtils.doubleQuotes(path)
}
case class Set(path: String, field: String) extends SetAccessor

case class GetSet(path: String, field: String) extends DualAccessor {
  override lazy val jsValue: String = JsUtils.doubleQuotes(path)
}

case class FunctionalGet(get: ScriptObjectMirror) extends GetAccessor {
  override val field: String = ""
  override val path : String = ""
}
case class FunctionalSet(set: ScriptObjectMirror) extends SetAccessor {
  override val field: String = ""
  override val path : String = ""
}


class ComponentAccessorManager {

  private var get : ComponentAccessor = null
  private var set : ComponentAccessor = null

  def add(componentAccessor: ComponentAccessor): Unit = {

    componentAccessor match {
      case a:DualAccessor => {
        get = componentAccessor
        set = componentAccessor
      }
      case a:SetAccessor => get = componentAccessor
      case a:GetAccessor => set = componentAccessor
    }

  }

  def accessors = (get, set)

  def isValid = get != null && set != null

}

case class ComponentAccessorWithPath(componentAccessor: ComponentAccessor, walkablePath: WalkablePath)