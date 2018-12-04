package com.opticdev.core.sourcegear.accumulate

import com.opticdev.common.SchemaRef
import com.opticdev.common.graph.path.PropertyPathWalker
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.gears.helpers.{LocationEvaluation, ModelField}
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode, ModelVectorMapping}
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensCodeComponent, OMLensComputedFieldComponent, OMLensSchemaComponent}
import play.api.libs.json._
import com.opticdev.core.utils.GetKeyFromJsValue._
import com.opticdev.sdk.skills_sdk.LensRef

import scala.util.Try

case class ComputedFieldListener(computedField: OMComponentWithPropertyPath[OMLensComputedFieldComponent], sublisteners: Vector[Listener], lensRef: LensRef) extends Listener {

  override def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext): Try[ModelField] = Try {
    val hiddenValue = modelNode.hiddenValue

    val numberOfComponents = computedField.component.subcomponents.size
    val argumentsMap = scala.collection.mutable.HashMap[Int, Option[JsValue]](Range(0, numberOfComponents).map(i => (i, None)):_*)

    //get arguments for all basic components
    computedField.component.subcomponents.zipWithIndex.foreach{ case (component, i) =>
        component match {
          case code: OMLensCodeComponent => {
            hiddenValue.walk(computedField.component.identifier, i.toString).foreach(value => argumentsMap.put(i, Some(value)))
          }
          case _ => None
        }
    }

    //get arguments for all listeners
    sublisteners.foreach({
      case schemaListener: MapSchemaListener => {
        val index = schemaListener.schemaComponent.propertyPath(1).toInt
        val evaluated = schemaListener.collect(astGraph, modelNode, sourceGearContext)
        argumentsMap.put(index,evaluated.map(_.value).toOption)
      }
      case assignmentListener: AssignmentListener => {
        val index = assignmentListener.assignmentComponent.propertyPath(1).toInt
        val evaluated = assignmentListener.collect(astGraph, modelNode, sourceGearContext)
        argumentsMap.put(index, evaluated.map(_.value).toOption)
      }
    })


    require(argumentsMap.forall(_._2.isDefined), "Computed Field can not be computed because required arguments could not be resolved")

    val argsVector = {
      val vec = argumentsMap.toVector.sortBy(_._1).map(_._2.get)
      if (computedField.component.enforceUniqueArguments) vec.distinct else vec
    }

    computedField.component.fieldProcessor
      .evaluate(argsVector)
      .map(i=> ModelField(computedField.propertyPath, i)).get

  }

  override val schema: Option[SchemaRef] = None
  override val mapToSchema: SchemaRef = null
}
