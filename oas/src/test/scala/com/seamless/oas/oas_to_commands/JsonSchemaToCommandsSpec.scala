package com.seamless.oas.oas_to_commands

import JsonSchemaToCommandsImplicits._
import com.seamless.contexts.shapes.Commands._
import com.seamless.oas.QueryImplicits._
import com.seamless.oas.ResolverTestFixture

class JsonSchemaToCommandsSpec extends ResolverTestFixture("2") {

  val mattermostResolver = resolverFor(mattermost)
  val adverseSchemasResolver = resolverFor(adverseSchemas)

  it("gets init commands for schemas") {
    val commands = mattermostResolver.definitions.map(_.toCommandStream)
    assert(commands.forall(_.init.size == 1))
    assert(commands.head.init(0).isInstanceOf[AddShape])
  }

  it("can describe fields of an object") {
    val teamMemberCommands = mattermostResolver.definitions.~#("TeamMember").toCommandStream
    teamMemberCommands.init.foreach(println)
    teamMemberCommands.describe.foreach(println)
    val withoutParentTypeAssign = teamMemberCommands.describe.slice(1, teamMemberCommands.describe.length)
    assert(Set(
      withoutParentTypeAssign.count(_.isInstanceOf[AddField]),
      withoutParentTypeAssign.count(_.isInstanceOf[SetFieldShape])
    ).size == 2)
  }

  it("can handle refs") {
    val channelMemberCommands = mattermostResolver.definitions.~#("ChannelMember").toCommandStream
    assert(channelMemberCommands.describe.exists {
      case i: SetBaseShape => true
      case _ => false
    })
  }

  it("All definition refs exist") {
    val allCommands = CommandStream.merge(mattermostResolver.definitions.map(_.toCommandStream))

    val allRefs = allCommands.describe.filter {
      case i: SetBaseShape => true
      case _ => false
    }.asInstanceOf[Vector[SetBaseShape]]

    allRefs.forall(i => mattermostResolver.definitions.exists(_.id == i.baseShapeId))
  }

  it("can collect the commands for a nested fields/objects") {
    val commands = adverseSchemasResolver.definitions.~#("NestedObject").toCommandStream
    (commands.init.foreach(println))
    (commands.describe.foreach(println))
    assert(commands.describe.size == 5)
    val rootObjectId = commands.init(0).asInstanceOf[AddShape].shapeId
    assert(commands.init == Seq(AddShape(rootObjectId, "$any", "NestedObject")))
    assert(commands.describe(0) == SetBaseShape(rootObjectId, "$object"))
    val objectFieldId = commands.describe(1).asInstanceOf[AddField].fieldId
    assert(commands.describe(1) == AddField(objectFieldId, rootObjectId, "object-field", FieldShapeFromShape(objectFieldId, "$any")))

  }

  it("can collect the commands for primitive at root level") {
    val commands = adverseSchemasResolver.definitions.~#("JustAPrimitive").toCommandStream

    assert(commands.describe.size == 1)
    assert(commands.describe.head.asInstanceOf[SetBaseShape].baseShapeId == "$string")
  }

  it("can collect the commands for ref at root level") {
    val commands = adverseSchemasResolver.definitions.~#("JustARef").toCommandStream

    val targetId = adverseSchemasResolver.resolveDefinition("#/definitions/NestedObject").get.id

    assert(commands.describe.size == 1)
    assert(commands.describe.head.asInstanceOf[SetBaseShape].baseShapeId == targetId)
  }

  it("can turn oneOf into Either w/ type parameters") {
    val commands = adverseSchemasResolver.definitions.~#("OneOfExample").toCommandStream
    println(commands.describe.map(_.toString).mkString("\n"))
  }

  it("can turn array of string into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfSingleType").toCommandStream

    val sliced = commands.describe.slice(4, 6)

    assert(sliced(1).asInstanceOf[SetParameterShape].shapeDescriptor.isInstanceOf[ProviderInShape])
  }

  it("can turn array of string and ref into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfStringAndRef").toCommandStream

    val sliced = commands.describe.slice(4, 8)
    assert(sliced(1).asInstanceOf[SetBaseShape].baseShapeId == "$oneOf")
  }

  it("can turn array of inline objects into commands") {
    val commands = adverseSchemasResolver.definitions.~#("ArrayOfInlineObject").toCommandStream
    null
  }


}
