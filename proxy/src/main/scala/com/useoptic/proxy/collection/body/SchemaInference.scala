package com.useoptic.proxy.collection.body

import javax.script.{CompiledScript, ScriptEngineManager}
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsObject, JsValue, Json}

object SchemaInference { //@todo using nashorn script for now...implement in scala

  val (engine, compiledScript) : (NashornScriptEngine, CompiledScript) = {
    val acornPath = this.getClass.getClassLoader.getResource("generateschema.js")
    val engine: NashornScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]

    val acornSource = scala.io.Source.fromInputStream(acornPath.openStream()).mkString

    val script = s"""
                    |(function () {
                    |${acornSource}
                    |return {schema: JSON.stringify(Process(JSON.parse(contents))) }
                    |})()
      """.stripMargin

    val compiledScript = engine.compile(script)
    (engine, compiledScript)
  }

  def infer(jsValue: JsValue): JsObject = {
    val bindings = engine.createBindings
    bindings.put("contents", jsValue.toString())
    val parsedJsonString = compiledScript.eval(bindings).asInstanceOf[ScriptObjectMirror]
    val astJSON: JsValue = Json.parse(parsedJsonString.get("schema").asInstanceOf[String])
    astJSON.as[JsObject]
  }

}
