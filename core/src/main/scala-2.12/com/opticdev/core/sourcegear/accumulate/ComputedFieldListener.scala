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

  override def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext): Option[ModelField] = Try {
    val hiddenValue = modelNode.hiddenValue

    val valuesForIndex = computedField.component.subcomponents.zipWithIndex.map{ case (component, i) =>
        component match {
          case code: OMLensCodeComponent => hiddenValue.walk(computedField.component.identifier, i.toString)
          case _ => None
        }
    }

    require(valuesForIndex.forall(_.isDefined), "Computed Field can not be computed because required arguments could not be resolved")

    computedField.component.fieldProcessor.evaluate(valuesForIndex.map(_.get)).map(i=> ModelField(computedField.propertyPath, i)).get
  }.toOption

  override val schema: Option[SchemaRef] = None
  override val mapToSchema: SchemaRef = null
}
