package com.seamless.oas.oas_to_commands

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.rfc.Commands.AddContribution
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.shapes.ShapesHelper
import com.seamless.oas.{Context, JsonSchemaType}
import com.seamless.oas.JsonSchemaType.{EitherType, JsonSchemaType, Ref, SingleType, Skipped}
import com.seamless.oas.Schemas.{Definition, JsonSchemaSchema, NamedDefinition, PropertyDefinition}
import play.api.libs.json.{JsArray, JsObject}

object JsonSchemaToCommandsImplicits {

  val mapping: Map[String, ShapeId] = Map(
    "string" -> "$string",
    "number" -> "$number",
    "integer" -> "$number",
    "boolean" -> "$boolean",
    "object" -> "$object",
    "array" -> "$list"
  )

  implicit class JsonSchemaTypeToCommand(t: JsonSchemaType) {
    def addCommandsForField(shapeId: ShapeId, fieldShapeId: ShapeId, fieldId: FieldId, name: String)(implicit cxt: Context, commandStream: MutableCommandStream) = {
      //println("addCommandsforField", shapeId, fieldId, t)
      commandStream.appendInit(AddShape(fieldShapeId, "$any", ""))
      t.addCommandsForShape(fieldShapeId)
      commandStream.appendInit(AddField(fieldId, shapeId, name, FieldShapeFromShape(fieldId, fieldShapeId)))
    }

    def addCommandsForParameter(shapeId: ShapeId, parameterId: ShapeParameterId)(implicit cxt: Context, commandStream: MutableCommandStream) = {
      //println("addCommandsForParameter", shapeId, parameterId, t)
      val parameterShapeId = ShapesHelper.newShapeId()
      t.addCommandsForShape(parameterShapeId)
      commandStream.appendDescribe(AddShapeParameter(parameterId, shapeId, ""))
      commandStream.appendDescribe(SetParameterShape(ProviderInShape(shapeId, ShapeProvider(parameterShapeId), parameterId)))
    }

    def addCommandsForShape(shapeId: ShapeId)(implicit cxt: Context, commandStream: MutableCommandStream): Unit = {
      //println("addCommandsForShape", shapeId, t)
      t match {
        case SingleType(t) => {
          val typeEquiv = mapping.getOrElse(t, "$any") //default to any if type is not supported (file, null)
          commandStream.appendInit(SetBaseShape(shapeId, typeEquiv))

          if (typeEquiv == "$list") {
            val items: Vector[JsObject] = (cxt.root \ "items").getOrElse(JsArray.empty) match {
              case a: JsArray => a.value.toVector.asInstanceOf[Vector[JsObject]]
              case obj: JsObject => Vector(obj)
              case _ => Vector()
            }

            println(items.length, items)
            items
              .map(i => (i, JsonSchemaType.fromDefinition(i)))
              .foreach {
                case (itemCtx, typeParam) => {
                  typeParam match {
                    case r: Ref => {
                      println("xxx")
                      val resource = cxt.resolver.resolveDefinition(r.resourceURI)
                      if (resource.isEmpty) {
                        commandStream.appendDescribe(SetParameterShape(ProviderInShape(shapeId, ShapeProvider("$any"), "$listItem")))
                      } else {
                        println(resource.get.id)
                        commandStream.appendDescribe(SetParameterShape(ProviderInShape(shapeId, ShapeProvider(resource.get.id), "$listItem")))
                      }
                    }
                    case _ => {
                      val itemShapeId = ShapesHelper.newShapeId()
                      commandStream.appendInit(AddShape(itemShapeId, "$any", s"inline shape ${itemShapeId}"))
                      typeParam.addCommandsForShape(itemShapeId)(cxt.resolver.buildContext(itemCtx), commandStream)
                      commandStream.appendDescribe(SetParameterShape(ProviderInShape(shapeId, ShapeProvider(itemShapeId), "$listItem")))

                    }
                  }
                }
              }
          }

        }
        case Skipped => {
          ////          println("Skipped an unsupported type at" + cxt.root)
          commandStream.appendDescribe(SetBaseShape(shapeId, "$any"))
        }
        case Ref(resourceUrl) => {
          val resource = cxt.resolver.resolveDefinition(resourceUrl)
          if (resource.isEmpty) {
            commandStream.appendDescribe(SetBaseShape(shapeId, "$any"))
          } else {
            commandStream.appendDescribe(SetBaseShape(shapeId, resource.get.id))
          }
        }
        case EitherType(allowedTypes) => {
          //will create a different type param for each possibility
          commandStream.appendDescribe(SetBaseShape(shapeId, "$oneOf"))
          allowedTypes.foreach { typeParam => {
            val parameterId = ShapesHelper.newShapeParameterId()
            typeParam.addCommandsForParameter(shapeId, parameterId)
          }
          }
        }
      }
    }
  }

  def processSchema(schema: JsonSchemaSchema, parentShapeId: Option[String] = None)(implicit commandStream: MutableCommandStream, conceptId: String = null): Unit = {

    schema match {
      case namedDef: NamedDefinition => {
        val shapeId = namedDef.id
        //println(s"named definition ${shapeId}")
        //init
        commandStream.appendInit(AddShape(shapeId, "$any", namedDef.name))
        //describe
        namedDef.`type`.addCommandsForShape(shapeId)(namedDef.cxt, commandStream)

        if (namedDef.description.isDefined) {
          commandStream appendDescribe AddContribution(shapeId, "description", namedDef.description.get)
        }

        schema.properties.foreach(f => {
          processSchema(f, Some(shapeId))
        })
      }

      case propertyDef: PropertyDefinition => {
        val fieldId = ShapesHelper.newFieldId()
        val fieldShapeId = ShapesHelper.newShapeId()

        //println(s"property definition ${fieldId} in ${parentShapeId.get}")
        propertyDef.`type`.addCommandsForField(parentShapeId.get, fieldShapeId, fieldId, propertyDef.key)(propertyDef.cxt, commandStream)

        if (propertyDef.description.isDefined) {
          commandStream appendDescribe AddContribution(fieldId, "description", propertyDef.description.get)
        }

        schema.properties.foreach(f => {
          processSchema(f, Some(fieldShapeId))
        })
      }
      case inlineDefinition: Definition => {
        val shapeId = inlineDefinition.id
        //println(s"inline definition ${shapeId}")

        commandStream.appendInit(AddShape(shapeId, "$any", ""))
        //describe
        inlineDefinition.`type`.addCommandsForShape(shapeId)(inlineDefinition.cxt, commandStream)

        if (inlineDefinition.description.isDefined) {
          commandStream appendDescribe AddContribution(shapeId, "description", inlineDefinition.description.get)
        }

        //process fields if any
        schema.properties.foreach(f => {
          processSchema(f, Some(shapeId))
        })
      }
    }

  }

  implicit class JsonSchemaSchemaToCommands(_schema: JsonSchemaSchema) {

    def toCommandStream: ImmutableCommandStream = {

      implicit val commandStream = CommandStream.emptyMutable

      processSchema(_schema)

      commandStream.toImmutable
    }

  }

}
