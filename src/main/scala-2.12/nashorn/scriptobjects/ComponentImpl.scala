package nashorn.scriptobjects

import compiler.JsUtils
import jdk.nashorn.api.scripting.ScriptObjectMirror
import compiler.lensparser.{ExampleBlock, Finder}
import nashorn.ScriptObjectUtils


class ComponentImpl(val finder: Finder) {

  //accessors
  val componentAccessorManager : ComponentAccessorManager = new ComponentAccessorManager

  def get(path: String, field: String) : ComponentImpl= {
    componentAccessorManager.add(Get(path, field))
    this
  }

  def set(path: String, field: String) : ComponentImpl= {
    componentAccessorManager.add(Set(path, field))
    this
  }

  def getSet(path: String, field: String) : ComponentImpl= {
    componentAccessorManager.add(GetSet(path, field))
    this
  }

  def get(scriptObjectMirror: ScriptObjectMirror) : ComponentImpl= {
    componentAccessorManager.add(FunctionalGet(scriptObjectMirror))
    this
  }

  def set(scriptObjectMirror: ScriptObjectMirror) : ComponentImpl= {
    componentAccessorManager.add(FunctionalSet(scriptObjectMirror))
    this
  }

  //rules

  def propRule(scriptObjectMirror: ScriptObjectMirror) : ComponentImpl = {
    val map = ScriptObjectUtils.parseToJsValue(scriptObjectMirror)
    this
  }


}

object ComponentImpl {

  def define(finder: Finder): ComponentImpl = new ComponentImpl(finder)

}