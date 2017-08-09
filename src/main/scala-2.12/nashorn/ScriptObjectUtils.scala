package nashorn

import java.awt.Color
import java.util
import javax.script.ScriptEngineManager

import jdk.nashorn.api.scripting.{JSObject, NashornScriptEngineFactory, ScriptObjectMirror}
import play.api.libs.json._

import collection.JavaConverters._

object ScriptObjectUtils {

  val engine = new NashornScriptEngineFactory().getScriptEngine("-scripting", "--no-java")
  val objConstructor = engine.eval("Object").asInstanceOf[JSObject]
  val undefined = engine.eval("undefined").asInstanceOf[JSObject]

  def parseToJsValue(valueOrig: Any) : JsValue = {

    if (valueOrig.isInstanceOf[String]) {
      JsString(valueOrig.asInstanceOf[String])
      //this needs testing. may not be the right signature
    } else if (valueOrig.isInstanceOf[Number]) {
      JsNumber(BigDecimal(valueOrig.asInstanceOf[Number].toString))
    } else if (valueOrig.isInstanceOf[Boolean]) {
      JsBoolean(valueOrig.asInstanceOf[Boolean])
    } else if (valueOrig.isInstanceOf[ScriptObjectMirror]) {

      val asScriptObject = valueOrig.asInstanceOf[ScriptObjectMirror]

      if (asScriptObject.isArray) {
        JsArray ( asScriptObject.entrySet().asScala.map(i=> {
          parseToJsValue(i.getValue)
        }).toSeq )
      } else {
        JsObject( asScriptObject.entrySet().asScala.map(i=> {
          i.getKey -> parseToJsValue(i.getValue)
        }).toSeq )
      }

    } else {
      JsNull
    }

  }

  def jsObjectToScriptObject(jsObject: JsObject) : JSObject = {

    val newObject = objConstructor.newObject().asInstanceOf[JSObject]

    jsObject.fields.map(i=> {
      if (i._2.isInstanceOf[JsString]) {
        newObject.setMember(i._1, i._2.asInstanceOf[JsString].value)
      } else

      if (i._2.isInstanceOf[JsNumber]) {
        newObject.setMember(i._1, i._2.asInstanceOf[JsNumber].value)
      } else

      if (i._2.isInstanceOf[JsBoolean]) {
        newObject.setMember(i._1, i._2.asInstanceOf[JsBoolean].value)
      } else {
        println(Color.RED+" Array and object conversions not implimented yet")
      }

    })

    newObject

  }

}
