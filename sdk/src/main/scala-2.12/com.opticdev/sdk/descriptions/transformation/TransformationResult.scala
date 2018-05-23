package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.{RenderOptions, VariableMapping}
import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject

import scala.util.Try


trait TransformationResult {def toStagedNode(options: Option[RenderOptions] = None) : StagedNode}

case class StagedNode(schema: SchemaRef,
                      value: JsObject,
                      options: Option[RenderOptions] = Some(RenderOptions(None, None, None))) extends TransformationResult {

  def toStagedNode(newOptions: Option[RenderOptions]) : StagedNode = StagedNode(schema, value, {
    if (newOptions.isEmpty && options.isEmpty) None else {
      Some(newOptions.getOrElse(RenderOptions()).mergeWith(options.getOrElse(RenderOptions())))
    }
  })

  def tagsMap = tags.toMap
  lazy val tags : Vector[(String, StagedNode)] = {
    options.map(opt=> {
      val thisEntryOption = opt.tag.map(i=> (i, this))
      val tags = opt.containers.getOrElse(Map.empty).values.flatten.flatMap(_.tags).toVector
      if (thisEntryOption.isDefined) (tags :+ thisEntryOption.get).toVector else tags.toVector
    }).getOrElse(Vector.empty)
  }

  def variablesForTag(tag: String) : VariableMapping = {
    if (!tagsMap.contains(tag)) {
      Map.empty
    } else {
      val childContainers = options.flatMap(_.containers).getOrElse(Map.empty)
      val childNodes = childContainers.flatMap(_._2).find(_.tagsMap.contains(tag))
      childNodes.map(_.variablesForTag(tag)).getOrElse(Map.empty) ++ this.options.flatMap(_.variables).getOrElse(Map.empty)
    }
  }

  def hasTags = tags.nonEmpty

  //defined will always override the things we are setting here
  def withVariableMapping(variableMapping: VariableMapping) = {
    this.copy(options = this.options.map(opts => {
      opts.copy(variables = Some(variableMapping ++ opts.variables.getOrElse(Map.empty)))
    }))
  }

}

case class SingleModel(schema: SchemaRef, value: JsObject) extends TransformationResult {
  def toStagedNode(newOptions: Option[RenderOptions]) : StagedNode = StagedNode(schema, value, newOptions)
}