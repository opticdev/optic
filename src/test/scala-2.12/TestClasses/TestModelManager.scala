package TestClasses

import cognitro.core.components.models.ModelDefinition
import cognitro.parsers.GraphUtils.NodeType
import providers.ModelProvider

object TestModelManager extends ModelProvider {

    private var models : Vector[ModelDefinition] = Vector()

    override def clear = models = Vector()

    override def addModel(modelDefinition: ModelDefinition): Unit = {
      //one is already here
      val existingModels = modelByIdentifier(modelDefinition.identifier)
      if (existingModels.isDefined) {
        removeModel(existingModels.get)
      }
      models :+= modelDefinition
    }

    override def addModels(is: ModelDefinition*) : Unit = {
      models ++= is.toVector
    }

    override def removeModel(modelDefinition: ModelDefinition): Unit = {
      models = models.filterNot(_ == modelDefinition)
    }

    override def modelByIdentifier(identifier: NodeType): Option[ModelDefinition] = {
      models.find(_.identifier == identifier)
    }

}
