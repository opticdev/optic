package providers

import cognitro.core.components.models.ModelDefinition
import cognitro.parsers.GraphUtils.NodeType

trait ModelProvider {

  def clear : Unit

  def addModel(modelDefinition: ModelDefinition)

  def addModels(is: ModelDefinition*)

  def removeModel(modelDefinition: ModelDefinition)

  def modelByIdentifier(identifier: NodeType): Option[ModelDefinition]

}