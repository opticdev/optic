package com.opticdev.sdk.skills_sdk.lens

import com.opticdev.sdk.rules.Rule
import play.api.libs.json.{JsArray, JsString, JsValue}

import scala.util.{Random, Try}


case class OMLensComputedFieldComponent(subcomponents: Vector[OMLensComponent],
                                        fieldProcessor: ComputedFieldFunction,
                                        enforceUniqueArguments: Boolean,
                                        identifier: String = Random.alphanumeric.take(9).mkString
                                       ) extends OMLensComponent {

  def codeComponents= subcomponents.zipWithIndex.collect {
    case (codeComponent: OMLensCodeComponent, index: Int) => OMComponentWithPropertyPath(Seq(identifier, index.toString), codeComponent, isHidden = true)
    case (assignmentComponent: OMLensAssignmentComponent, index: Int) => OMComponentWithPropertyPath(Seq(identifier, index.toString), assignmentComponent, isHidden = true)
  }.asInstanceOf[Vector[OMComponentWithPropertyPath[OMLensComponent]]]

  def accumulatorInputComponents: Vector[OMComponentWithPropertyPath[OMLensComponent]] = subcomponents.zipWithIndex.collect {
    case (component: OMLensComponent, index: Int) if !component.isInstanceOf[OMLensCodeComponent] =>
      OMComponentWithPropertyPath(Seq(identifier, index.toString), component, isHidden = true)
  }

  override def rules: Vector[Rule] = subcomponents.flatMap(_.rules)
  override def `type`: OMLensComponentType = NotSupported
  override def capabilities: OpticCapabilities = OpticCapabilities(generate = false, mutate = false, parse = true)
}


sealed trait ComputedFieldFunction {def evaluate(jsValue: Vector[JsValue]): Try[JsValue]}
case object ConcatStrings extends ComputedFieldFunction {
  override def evaluate(jsValues: Vector[JsValue]): Try[JsValue] = Try {
    require(jsValues.forall(_.isInstanceOf[JsString]), "Can not concat non-string values in collection: "+jsValues)
    JsString(jsValues.map(_.as[JsString].value).mkString)
  }
}

case object ConcatArrays extends ComputedFieldFunction {
  override def evaluate(jsValues: Vector[JsValue]): Try[JsValue] = Try {
    require(jsValues.forall(_.isInstanceOf[JsArray]), "Can not concat non-array values in collection: "+jsValues)
    JsArray(jsValues.flatMap(_.as[JsArray].value))
  }
}