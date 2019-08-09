package com.seamless.oas.oas_to_commands

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.rfc.Commands.AddContribution
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.oas.{IdGenerator, JsonSchemaType, ResolverContext}
import com.seamless.oas.JsonSchemaType.{ArrayType, EitherType, JsonSchemaType, ObjectType, Ref, SingleType, Skipped}
import com.seamless.oas.Schemas.{InlineDefinition, JsonSchemaSchema, NamedDefinition, ObjectDefinition, PropertyDefinition}
import play.api.libs.json.{JsArray, JsObject}

sealed trait TraversalContext
case class RootContext() extends TraversalContext
case class InlineDefinitionContext(shapeId: ShapeId) extends TraversalContext
case class NamedDefinitionContext(shapeId: ShapeId, name: String) extends TraversalContext
case class ObjectContext(shapeId: ShapeId) extends TraversalContext
case class ObjectFieldContext(shapeId: ShapeId, fieldId: FieldId) extends TraversalContext
case class ArrayContext(shapeId: ShapeId) extends TraversalContext

object JsonSchemaToCommandsImplicits {

  val mapping: Map[String, BaseShape] = Map(
    "string" -> CoreShape("$string"),
    "number" -> CoreShape("$number"),
    "integer" -> CoreShape("$number"),
    "boolean" -> CoreShape("$boolean"),
  )

  val coreShapeIds: Set[ShapeId] = Set("$string", "$number", "$boolean", "$object", "$list", "$any")
  sealed trait BaseShape {
    val shapeId: ShapeId
  }
  case class CoreShape(shapeId: ShapeId) extends BaseShape
  case class UserDefinedShape(shapeId: ShapeId) extends BaseShape
  case class InstanceType(shapeId: ShapeId) extends BaseShape

  implicit class JsonSchemaTypeToCommand(t: JsonSchemaType) {
    def baseShape()(implicit ctx: ResolverContext, commandStream: MutableCommandStream): BaseShape = {
      t match {
        case SingleType(t) => {
          mapping.get(t) match {
            case Some(s) => s
            case None => {
              //println(s"loosening ${t} to $$any")
              CoreShape("$any") //default to any if type is not supported (file, null)
            }
          }
        }
        case Ref(resourceURI) => {
          val resource = ctx.resolver.resolveDefinition(resourceURI)
          if (resource.isEmpty) {
            CoreShape("$any")
          } else {
            UserDefinedShape(resource.get.id)
          }
        }
        case EitherType(typeParameters) => {
          CoreShape("$oneOf") // should eventually become InstanceType?
        }
        case Skipped => {
          CoreShape("$any")
        }
        case ArrayType() => {
          CoreShape("$list")
        }
        case ObjectType() => {
          InstanceType("$object")
        }
      }
    }

    def addCommandsForField(baseShape: BaseShape, definition: JsonSchemaSchema, traversalContext: TraversalContext)(implicit ctx: ResolverContext, commandStream: MutableCommandStream) = {
      //println("addCommandsForField")
      if (definition.description.isDefined) {
        commandStream appendDescribe AddContribution(definition.id, "description", definition.description.get)
      }
      val baseShapeId = baseShape.shapeId
      if (baseShapeId == "$list") {
        //println(s"nesting into ${baseShapeId}")
        val items: Vector[JsObject] = (ctx.root \ "items").getOrElse(JsArray.empty) match {
          case a: JsArray => a.value.toVector.asInstanceOf[Vector[JsObject]]
          case obj: JsObject => Vector(obj)
          case _ => Vector()
        }
        //println(items.length, items)
        items
          .map(i => (i, JsonSchemaType.fromDefinition(i)))
          .foreach {
            case (itemCtx, itemSchemaType: JsonSchemaType) => {
              itemSchemaType match {
                case r: Ref => {
                  val resource = ctx.resolver.resolveDefinition(r.resourceURI)
                  if (resource.isEmpty) {
                    commandStream.appendDescribe(SetParameterShape(ProviderInField(definition.id, ShapeProvider("$any"), "$listItem")))
                  } else {
                    //println(resource.get.id)
                    commandStream.appendDescribe(SetParameterShape(ProviderInField(definition.id, ShapeProvider(resource.get.id), "$listItem")))
                  }
                }
                case _ => {
                  //println("field xyz - non-ref array item", itemSchemaType.baseShape())

                  itemSchemaType.baseShape() match {
                    case UserDefinedShape(shapeId) => {
                      commandStream.appendDescribe(SetParameterShape(ProviderInField(definition.id, ShapeProvider(shapeId), "$listItem")))
                    }
                    case CoreShape(shapeId) => {
                      commandStream.appendDescribe(SetParameterShape(ProviderInField(definition.id, ShapeProvider(shapeId), "$listItem")))
                    }
                    case InstanceType(shapeId) => {
                      //println(s"field array item is inline object", itemCtx)
                      val parentObjectId = IdGenerator.inlineDefinition
                      processSchema(ObjectDefinition(parentObjectId, itemCtx, "")(definition.ctx), InlineDefinitionContext(definition.id))(commandStream)
                      commandStream.appendDescribe(SetParameterShape(ProviderInField(definition.id, ShapeProvider(parentObjectId), "$listItem")))
                    }
                  }
                }
              }
            }
          }
      }
      else if (baseShapeId == "$object") {
        //println(s"nesting into ${baseShapeId}")
        val name = traversalContext match {
          case NamedDefinitionContext(_, name) => name
          case _ => ""
        }
        processSchema(ObjectDefinition(definition.id, definition.definition, name), ObjectContext(definition.id))
      }
      else if (baseShapeId == "$oneOf") {
        //println(s"nesting into ${baseShapeId}")
      }
    }


    def addCommandsForShape(baseShapeId: ShapeId, definition: JsonSchemaSchema, traversalContext: TraversalContext)(implicit ctx: ResolverContext, commandStream: MutableCommandStream): Unit = {
      //println("addCommandsForShape", baseShapeId, definition)
      if (definition.description.isDefined) {
        commandStream appendDescribe AddContribution(definition.id, "description", definition.description.get)
      }

      if (baseShapeId == "$list") {
        //println(s"nesting into ${baseShapeId}")
        val items: Vector[JsObject] = (ctx.root \ "items").getOrElse(JsArray.empty) match {
          case a: JsArray => a.value.toVector.asInstanceOf[Vector[JsObject]]
          case obj: JsObject => Vector(obj)
          case _ => Vector()
        }
        //println(items.length, items)
        items
          .map(i => (i, JsonSchemaType.fromDefinition(i)))
          .foreach {
            case (itemCtx, itemSchemaType: JsonSchemaType) => {
              itemSchemaType match {
                case r: Ref => {
                  val resource = ctx.resolver.resolveDefinition(r.resourceURI)
                  if (resource.isEmpty) {
                    commandStream.appendDescribe(SetParameterShape(ProviderInShape(definition.id, ShapeProvider("$any"), "$listItem")))
                  } else {
                    //println(resource.get.id)
                    commandStream.appendDescribe(SetParameterShape(ProviderInShape(definition.id, ShapeProvider(resource.get.id), "$listItem")))
                  }
                }
                case _ => {
                  //println("shape xyz - non-ref array item", itemSchemaType.baseShape())

                  itemSchemaType.baseShape() match {
                    case UserDefinedShape(shapeId) => {
                      commandStream.appendDescribe(SetParameterShape(ProviderInShape(definition.id, ShapeProvider(shapeId), "$listItem")))
                    }
                    case CoreShape(shapeId) => {
                      commandStream.appendDescribe(SetParameterShape(ProviderInShape(definition.id, ShapeProvider(shapeId), "$listItem")))
                    }
                    case InstanceType(shapeId) => {
                      //println(s"shape array item is inline object", itemCtx)
                      val parentObjectId = IdGenerator.inlineDefinition
                      processSchema(ObjectDefinition(parentObjectId, itemCtx, "")(definition.ctx), InlineDefinitionContext(definition.id))(commandStream)
                      commandStream.appendDescribe(SetParameterShape(ProviderInShape(definition.id, ShapeProvider(parentObjectId), "$listItem")))
                    }
                  }
                }
              }
            }
          }
      }
      else if (baseShapeId == "$object") {
        //println(s"nesting into ${baseShapeId}")
        val name = traversalContext match {
          case NamedDefinitionContext(_, name) => name
          case _ => ""
        }
        processSchema(ObjectDefinition(definition.id, definition.definition, name), ObjectContext(definition.id))
      }
      else if (baseShapeId == "$oneOf") {
        //println(s"nesting into ${baseShapeId}")
      }
    }
  }

  def processJsonSchema(schema: JsonSchemaType, traversalContext: TraversalContext)(implicit commandStream: MutableCommandStream): Unit = {

  }

  def processSchema(schema: JsonSchemaSchema, traversalContext: TraversalContext)(implicit commandStream: MutableCommandStream): Unit = {
    //println("processSchema")
    schema match {
      case definition: NamedDefinition => {
        //println("NamedDefinition", definition)
        val baseShape = definition.schemaType.baseShape()(definition.ctx, commandStream)
        baseShape match {
          case CoreShape(shapeId) => {
            commandStream appendInit AddShape(definition.id, shapeId, definition.name)
          }
          case UserDefinedShape(shapeId) => {
            commandStream appendInit AddShape(definition.id, "$any", definition.name)
            commandStream appendDescribe SetBaseShape(definition.id, shapeId)
          }
          case InstanceType(shapeId) => {
            //println(s"InstanceType ${shapeId}")
            val parentObjectId = IdGenerator.inlineDefinition
            processSchema(ObjectDefinition(parentObjectId, definition.definition, "")(definition.ctx), NamedDefinitionContext(definition.id, definition.name))(commandStream)
          }
        }
        definition.schemaType.addCommandsForShape(baseShape.shapeId, definition, NamedDefinitionContext(definition.id, definition.name))(definition.ctx, commandStream)
      }
      case definition: InlineDefinition => {
        //println("InlineDefinition", definition)
        val baseShape = definition.schemaType.baseShape()(definition.ctx, commandStream)
        baseShape match {
          case CoreShape(shapeId) => {
            commandStream appendInit AddShape(definition.id, shapeId, "")
          }
          case UserDefinedShape(shapeId) => {
            commandStream appendDescribe AddShape(definition.id, shapeId, "")
          }
          case InstanceType(shapeId) => {
            val parentObjectId = IdGenerator.inlineDefinition
            processSchema(ObjectDefinition(parentObjectId, definition.definition, "")(definition.ctx), InlineDefinitionContext(definition.id))(commandStream)
          }
        }
        definition.schemaType.addCommandsForShape(baseShape.shapeId, definition, InlineDefinitionContext(definition.id))(definition.ctx, commandStream)
      }
      case definition: PropertyDefinition => {
        //println("PropertyDefinition", definition)
        val baseShape = definition.schemaType.baseShape()(definition.ctx, commandStream)
        val fieldShapeId: ShapeId = baseShape match {
          case CoreShape(shapeId) => shapeId
          case UserDefinedShape(shapeId) => shapeId
          case InstanceType(shapeId) => {
            val parentObjectId = IdGenerator.inlineDefinition
            processSchema(ObjectDefinition(parentObjectId, definition.definition, "")(definition.ctx), InlineDefinitionContext(definition.id))(commandStream)
            parentObjectId
          }
        }
        commandStream appendDescribe AddField(definition.id, definition.parentId, definition.key, FieldShapeFromShape(definition.id, fieldShapeId))
        definition.schemaType.addCommandsForField(baseShape, definition, ObjectFieldContext(definition.parentId, definition.id))(definition.ctx, commandStream)
      }
      case definition: ObjectDefinition => {
        //println("ObjectDefinition", definition)
        commandStream appendInit AddShape(definition.id, "$object", definition.name)
        definition.properties.foreach(p => {
          processSchema(p, ObjectFieldContext(definition.id, p.id))
        })
      }
    }
  }

  implicit class JsonSchemaSchemaToCommands(_schema: JsonSchemaSchema) {

    def toCommandStream: ImmutableCommandStream = {

      implicit val commandStream = CommandStream.emptyMutable
      //println("\n[    BEFORE    ]")
      processSchema(_schema, RootContext())
      //println("[    AFTER     ]\n")
//      commandStream.toImmutable.flatten.foreach(println)
      commandStream.toImmutable
    }

  }

}

/*
Either we are visiting a Named Definition, a Property Definition, or an Inline Definition
then for each root, processSchema(root)
(roots = named definitions first)
(then do the resulting property and inline ones as they come)
(roots = request/respones/parameter shapes)
(then do the resulting property and inline ones as they come)
we want to add all the named definitions as "$any" in the init phase, and immediately queue setting to the actual target shape in the describe phase
fields that are inline objects should define the inline object first and then add the field pointing to the inline object

NamedDefinition Pet ->
- ensure a shape is defined with the definition.id so it can be referenced in the describe phase by other things
- ensure it will be set to the correct shape later
 */