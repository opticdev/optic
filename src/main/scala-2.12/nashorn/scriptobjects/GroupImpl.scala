package nashorn.scriptobjects

import cognitro.core.components.models.ModelDefinition
import compiler.Compilable



class GroupImpl(val name: String,
                val modelDefinition: Option[ModelDefinition] = None) extends Compilable{

  private var groupables : Vector[Groupable] = Vector()
  def allGroupables = groupables

  def required(item: Groupable) : GroupImpl = {
    item.presence = Presence.REQUIRED
    groupables = groupables :+ item
    this
  }

  def optional(item: Groupable) : GroupImpl = {
    item.presence = Presence.OPTIONAL
    groupables = groupables :+ item
    this
  }

  def distinct(item: Groupable) : GroupImpl = {
    item.presence = Presence.DISTINCT
    groupables = groupables :+ item
    this
  }

}

object GroupImpl {

  def define(name: String, modelDefinition: ModelDefinition): GroupImpl = {
    new GroupImpl(name, Option(modelDefinition))
  }

  def define(name: String): GroupImpl = {
    new GroupImpl(name)
  }

}