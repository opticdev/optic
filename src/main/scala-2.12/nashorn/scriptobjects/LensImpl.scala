package nashorn.scriptobjects

import cognitro.core.components.models.ModelDefinition
import compiler.{Compilable, Rules}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import compiler.lensparser.{ExampleBlock, Finder}
import nashorn.scriptobjects.accumulators.Accumulator

class LensImpl(val name: String, val modelDefinition: ModelDefinition, val template: ExampleBlock) extends Compilable with Groupable {

  override val isLens = true

  var visibleTo : scala.collection.Set[Accumulator] = scala.collection.Set()

  private var components : Vector[ComponentImpl] = Vector()
  def allComponents = components

  def component(component: ComponentImpl) : LensImpl = {
    components = components :+ component
    this
  }

  private var rules : Vector[ComponentImpl] = Vector()
  def allRules = rules


  def rule(rule: ComponentImpl) : LensImpl = {
    rules = rules :+ rule
    this
  }

  private var variables : Vector[Variable] = Vector()
  def allVariables = variables


  def variable(string: String, options: ScriptObjectMirror) : LensImpl = {
    variables = variables :+ new Variable(string, options)
    this
  }

  def variable(string: String) : LensImpl = {
    variable(string, null)
    this
  }

  override def toString: String = "Lens "+name

}

object LensImpl {

  def define(name: String, modelDefinition: ModelDefinition, exampleBlock: ExampleBlock): LensImpl = {
    new LensImpl(name, modelDefinition, exampleBlock)
  }

}