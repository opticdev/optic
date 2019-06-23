package com.seamless.oas.oas_to_commands

import com.seamless.contexts.data_types.Commands.{AddField, AddTypeParameter, AssignType, DefineConcept, DefineInlineConcept, SetConceptName, SetFieldName}
import com.seamless.contexts.data_types.Primitives._
import com.seamless.contexts.rfc.Commands.{AddContribution, RfcCommand}
import com.seamless.oas.{Context, JsonSchemaType}
import com.seamless.oas.JsonSchemaType.{EitherType, JsonSchemaType, Ref, SingleType, Skipped}
import com.seamless.oas.Schemas.{Definition, JsonSchemaSchema, NamedDefinition, PropertyDefinition}
import play.api.libs.json.{JsArray, JsObject}

import scala.util.{Either, Random, Try}

object JsonSchemaToCommandsImplicits {

  def newId(): String = s"shape_${Random.alphanumeric take 10 mkString}"

  val mapping: Map[String, PrimitiveType] = Map(
    "string" -> StringT,
    "number" -> NumberT,
    "integer" -> IntegerT,
    "boolean" -> BooleanT,
    "object" -> ObjectT,
    "array" -> ListT
  )

  implicit class JsonSchemaTypeToCommand(t: JsonSchemaType) {
    def addAssignTypeCommands(id: String, conceptId: String)(implicit cxt: Context, commandStream: MutableCommandStream): Unit = {
      t match {
        case SingleType(t) => {
          val typeEquiv = mapping.getOrElse(t, AnyT) //default to any if type is not supported (file, null)
          commandStream.appendDescribe(AssignType(id, typeEquiv, conceptId))

          if (typeEquiv.hasTypeParameters) {
            val items: Vector[JsObject] = (cxt.root \ "items").getOrElse(JsArray.empty) match {
              case a: JsArray => a.value.toVector.asInstanceOf[Vector[JsObject]]
              case obj: JsObject => Vector(obj)
              case _ => Vector()
            }

            items
              .map(i => (i, JsonSchemaType.fromDefinition(i)))
              .foreach { case (itemCtx, typeParam) => {
                val typeParamId = newId()
                commandStream.appendDescribe(AddTypeParameter(id, typeParamId, conceptId))
                typeParam.addAssignTypeCommands(typeParamId, conceptId)(cxt.resolver.buildContext(itemCtx), commandStream)
              }}
          }

        }
        case Skipped => {
//          println("Skipped an unsupported type at" + cxt.root)
          commandStream.appendDescribe(AssignType(id, AnyT, conceptId))
        }
        case Ref(resourceUrl) => {
          val resource = cxt.resolver.resolveDefinition(resourceUrl)
          if (resource.isEmpty) {
            commandStream.appendDescribe(AssignType(id, AnyT, conceptId))
          } else {
            commandStream.appendDescribe(AssignType(id, RefT(resource.get.id), conceptId))
          }
        }
        case EitherType(allowedTypes) => {
          //will create a different type param for each possibility
          commandStream.appendDescribe(AssignType(id, EitherT, conceptId))
          allowedTypes.foreach { typeParam => {
            val typeParamId = newId()
            commandStream.appendDescribe(AddTypeParameter(id, typeParamId, conceptId))
            typeParam.addAssignTypeCommands(typeParamId, conceptId)
          }
          }
        }
      }
    }
  }

  def processSchema(schema: JsonSchemaSchema, parentShapeId: Option[String] = None)(implicit commandStream: MutableCommandStream, conceptId: String = null): Unit = {

    schema match {
      case namedDef: NamedDefinition => {
        implicit val conceptId = namedDef.id
        val rootId = newId()
        //init
        commandStream.appendInit(DefineConcept(namedDef.name, rootId, conceptId))
        commandStream.appendInit(SetConceptName(namedDef.name, conceptId))
        //describe
        namedDef.`type`.addAssignTypeCommands(rootId, conceptId)(namedDef.cxt, commandStream)

        if (namedDef.description.isDefined) {
          commandStream appendDescribe AddContribution(conceptId, "description", namedDef.description.get)
        }

        schema.properties.foreach(f => {
          processSchema(f, Some(rootId))
        })
      }

      case propertyDef: PropertyDefinition => {
        val fieldId = newId()
        //Add the field
        commandStream.appendDescribe(AddField(parentShapeId.get, fieldId, conceptId))
        //Name it
        commandStream.appendDescribe(SetFieldName(fieldId, propertyDef.key, conceptId))
        //Set the type
        propertyDef.`type`.addAssignTypeCommands(fieldId, conceptId)(propertyDef.cxt, commandStream)

        if (propertyDef.description.isDefined) {
          commandStream appendDescribe AddContribution(fieldId, "description", propertyDef.description.get)
        }

        schema.properties.foreach(f => {
          processSchema(f, Some(fieldId))
        })
      }
      case inlineDefinition: Definition => {
        implicit val conceptId = inlineDefinition.id
        val rootId = newId()

        commandStream.appendInit(DefineInlineConcept(rootId, conceptId))
        //describe
        inlineDefinition.`type`.addAssignTypeCommands(rootId, conceptId)(inlineDefinition.cxt, commandStream)

        if (inlineDefinition.description.isDefined) {
          commandStream appendDescribe AddContribution(conceptId, "description", inlineDefinition.description.get)
        }

        //process fields if any
        schema.properties.foreach(f => {
          processSchema(f, Some(rootId))
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
