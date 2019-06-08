package com.seamless.oas.oas_to_commands

import org.scalatest.FunSpec
import JsonSchemaToCommandsImplicits._
import com.seamless.contexts.data_types.Commands.{AddField, AddTypeParameter, AssignType, DefineConcept, SetConceptName, SetFieldName}
import com.seamless.contexts.data_types.Primitives.{RefT, StringT}
import com.seamless.contexts.rfc.RfcService
import com.seamless.oas.QueryImplicits._
import com.seamless.oas.ResolverTestFixture

class JsonSchemaToCommandsSpec extends ResolverTestFixture("2") {

  val mattermostResolver = resolverFor(mattermost)
  val adverseSchemasResolver = resolverFor(adverseSchemas)

  it("gets init commands for schemas") {
    val commands = mattermostResolver.definitions.map(_.toCommandStream)
    assert(commands.forall(_.init.size == 2))
    assert(commands.head.init(0).isInstanceOf[DefineConcept])
    assert(commands.head.init(1).isInstanceOf[SetConceptName])
  }

  it("can describe fields of an object") {
    val teamMemberCommands = mattermostResolver.definitions.~#("TeamMember").toCommandStream

    val withoutParentTypeAssign = teamMemberCommands.describe.slice(1, teamMemberCommands.describe.length)
    assert(Set(
      withoutParentTypeAssign.count(_.isInstanceOf[AddField]),
      withoutParentTypeAssign.count(_.isInstanceOf[SetFieldName]),
      withoutParentTypeAssign.count(_.isInstanceOf[AssignType])
    ).size == 1)
  }

  it("can handle refs") {
    val channelMemberCommands = mattermostResolver.definitions.~#("ChannelMember").toCommandStream
    assert(channelMemberCommands.describe.exists{
      case i: AssignType if i.to.isRef => true
      case _ => true
    })
  }

  it("All definition refs exist") {
    val allCommands = CommandStream.merge(mattermostResolver.definitions.map(_.toCommandStream))

    val allRefs = allCommands.describe.filter {
      case i: AssignType if i.to.isRef => true
      case _ => false
    }.asInstanceOf[Vector[AssignType]]

    allRefs.forall(i => mattermostResolver.definitions.exists(_.id == i.to.asInstanceOf[RefT].conceptId))
  }

  it("can collect the commands for a nested fields/objects") {
    val commands = adverseSchemasResolver.definitions.~#("NestedObject").toCommandStream

    assert(commands.describe.size == 7)
    val firstObjectId = commands.describe(1).asInstanceOf[AddField].id
    assert(commands.describe(4).asInstanceOf[AddField].parentId == firstObjectId)
    println(commands.describe.map(_.toString).mkString("\n"))

  }

  it("can collect the commands for primitive at root level") {
    val commands = adverseSchemasResolver.definitions.~#("JustAPrimitive").toCommandStream

    assert(commands.describe.size == 1)
    assert(commands.describe.head.asInstanceOf[AssignType].to == StringT)
  }

  it("can collect the commands for ref at root level") {
    val commands = adverseSchemasResolver.definitions.~#("JustARef").toCommandStream

    val targetId = adverseSchemasResolver.resolveDefinition("#/definitions/NestedObject").get.id

    assert(commands.describe.size == 1)
    assert(commands.describe.head.asInstanceOf[AssignType].to == RefT(targetId))
  }

  it("can turn oneOf into Either w/ type parameters") {
    val commands = adverseSchemasResolver.definitions.~#("OneOfExample").toCommandStream
    println(commands.describe.map(_.toString).mkString("\n"))
  }

  it("can turn array of string into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfSingleType").toCommandStream

    val sliced = commands.describe.slice(4, 6)

    assert(sliced(0).isInstanceOf[AddTypeParameter])
    assert(sliced(1).asInstanceOf[AssignType].to == StringT)
  }

  it("can turn array of string and ref into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfStringAndRef").toCommandStream

    val sliced = commands.describe.slice(4, 8)
    assert(sliced(0).isInstanceOf[AddTypeParameter])
    assert(sliced(1).asInstanceOf[AssignType].to == StringT)

    assert(sliced(2).isInstanceOf[AddTypeParameter])
    assert(sliced(3).asInstanceOf[AssignType].to.isRef)
  }

  it("can turn array of inline objects into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfInlineObject").toCommandStream
    null
  }


}
