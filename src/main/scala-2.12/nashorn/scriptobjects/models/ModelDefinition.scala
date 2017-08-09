package cognitro.core.components.models

import cognitro.parsers.GraphUtils.{ModelType, NodeType}
import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jsonschema.core.report.ProcessingReport
import com.github.fge.jsonschema.main.{JsonSchema, JsonSchemaFactory}
import compiler.JsUtils
import jdk.nashorn.api.scripting.ScriptObjectMirror
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.Groupable
import play.api.libs.json._
import providers.Provider

class ModelDefinition(val identifier: ModelType, schema: JsonSchema, userDefinedModel: JsValue)(implicit val provider: Provider) {

  //run validation for the model and make sure it works
    //else throw an error

  //@todo change to new instance
  def instanceOf(instance: ScriptObjectMirror) : ModelInstance = {
    val asJsValue = ScriptObjectUtils.parseToJsValue(instance)
    instanceOf(asJsValue)
  }

  def instanceOf(asJsValue: JsValue) : ModelInstance = {
    val report = validate(asJsValue)

    if (report.isSuccess) {
      new ModelInstance(this, asJsValue)
    } else {
      throw new Error(asJsValue+" does not conform to Schema "+identifier.name+"\n"+report.toString)
    }

  }

  private def validate(jsValue: JsValue): ProcessingReport = schema.validate(jsValue.as[JsonNode])

  def asJsonString: String = userDefinedModel.toString()
  def asJson = userDefinedModel

}

object ModelDefinition {

  def define(model: ScriptObjectMirror, providerFromJS: Provider): ModelDefinition = {

    implicit val provider = providerFromJS

    val jsObject = ScriptObjectUtils.parseToJsValue(model)

    val identifier = (jsObject \ "identifier").getOrElse(JsString(randomId))

    if (validateSchema(jsObject) && identifier != null) {
      val modelDefinition = new ModelDefinition(ModelType(identifier.asInstanceOf[JsString].value), generateSchema(jsObject), jsObject)
      provider.modelProvider.addModel(modelDefinition)
      modelDefinition
    } else {
      throw new Error("Invalid schema defined for model")
    }

  }

  private val r = new scala.util.Random
  def randomId : String = r.nextString(15)

  def load(identifier: String)(implicit provider: Provider): ModelDefinition = {

    val model = provider.modelProvider.modelByIdentifier(ModelType(identifier))
    if (model.isDefined) model.get else throw new Error("No model found for identifier "+JsUtils.doubleQuotes(identifier))
  }

  def empty()(implicit provider: Provider) : ModelDefinition = new ModelDefinition(ModelType("EMPTY"), generateSchema(JsObject(Seq())), JsObject(Seq()))

  private val validatorFactory = JsonSchemaFactory.newBuilder().freeze()
  def generateSchema(jsValue: JsValue): JsonSchema = validatorFactory.getJsonSchema(jsValue.as[JsonNode])
  def validateSchema(jsValue: JsValue): Boolean = validatorFactory.getSyntaxValidator.schemaIsValid(jsValue.as[JsonNode])


}

class ModelInstance(val definition: ModelDefinition, var value: JsValue) extends Groupable {
  override def toString: String = super.toString+" "+this.value.toString()
  override val isModel = true
}