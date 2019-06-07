package com.seamless.oas.oas_to_commands

import com.seamless.contexts.data_types.Commands.{AddField, AddTypeParameter, AssignType, DefineConcept, SetConceptName, SetFieldName}
import com.seamless.contexts.data_types.Primitives._
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.oas.Context
import com.seamless.oas.JsonSchemaType.{EitherType, JsonSchemaType, Ref, SingleType}
import com.seamless.oas.Schemas.{JsonSchemaSchema, NamedDefinition, PropertyDefinition}

import scala.util.{Either, Random, Try}

object JsonSchemaToCommandsImplicits {

  private def newId(): String = s"shape_${Random.alphanumeric take 10 mkString}"

  val mapping: Map[String, PrimitiveType] = Map(
    "string" -> StringT,
    "number" -> NumberT,
    "integer" -> IntegerT,
    "boolean" -> BooleanT,
    "object" -> ObjectT,
    "array" -> ListT
  )

  //@todo will not support more complex type assignments, needs to branch higher?
  implicit class JsonSchemaTypeToCommand(t: JsonSchemaType) {
    def addAssignTypeCommands(id: String, conceptId: String)(implicit cxt: Context, commandStream: MutableCommandStream): Unit = {
      t match {
        case SingleType(t) => {
          val typeEquiv = mapping(t)
          commandStream.appendDescribe(AssignType(id, typeEquiv, conceptId))
        }
        case Ref(resourceUrl) => {
          val resource = cxt.resolver.resolveDefinition(resourceUrl)

          commandStream.appendDescribe(AssignType(id, RefT(resource.get.id), conceptId))
        }
        case EitherType(allowedTypes) => {
          //will create a different type param for each possibility

          commandStream.appendDescribe(AssignType(id, EitherT, conceptId))
          allowedTypes.foreach{ typeParam => {
            val typeParamId = newId()
            commandStream.appendDescribe(AddTypeParameter(id, typeParamId, conceptId))
            typeParam.addAssignTypeCommands(typeParamId, conceptId)
          }}
        }
      }
    }
  }

  def processSchema(schema: JsonSchemaSchema, parentShapeId: Option[String] = None)(implicit commandStream: MutableCommandStream, conceptId: String = null): Unit = {

    schema match {
      case namedDef:NamedDefinition => {
        implicit val conceptId = namedDef.id
        val rootId = newId()
        //init
        commandStream.appendInit(DefineConcept(namedDef.name, rootId, conceptId))
        commandStream.appendInit(SetConceptName(namedDef.name, conceptId))
        //describe
        namedDef.`type`.addAssignTypeCommands(rootId, conceptId)(namedDef.cxt, commandStream)

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

        schema.properties.foreach(f => {
          processSchema(f, Some(fieldId))
        })
      }

      case _ =>
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
