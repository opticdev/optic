package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.projections.NamedShapes
import org.scalatest.FunSpec

class ShapesEndToEndSpec extends FunSpec {
  def fixture(commands: Seq[ShapesCommand]): (Vector[RfcEvent], ShapesState) = {
    println("Steps:")
    commands.foreach(println)

    println("Running...")
    commands.foldLeft((Vector.empty[RfcEvent], ShapesAggregate.initialState)) {
      case (acc, command) => {
        val (events, state) = acc

        val effects = ShapesAggregate.handleCommand(state)(ShapesCommandContext(), command)

        val newState = effects.eventsToPersist.foldLeft(state) {
          case (s, event) => ShapesAggregate.applyEvent(event, s)
        }

        (events ++ effects.eventsToPersist, newState)
      }
    }
  }

  describe("Shapes") {
    describe("using identifier") {
      val commands = Seq(
        AddShape("$Id", "$identifier", "ID"),
        AddShape("$UnboundId", "$identifier", "Unbound ID"),
        SetParameterShape(ProviderInShape("$Id", ShapeProvider("$string"), "$identifierInner")),
      )
      it("should resolve bindings to $any when unbound and whatever was bound when bound") {
        val (events, finalState) = fixture(commands)

        assert(finalState.resolveParameterBindings("$identifier").size == 1)
        assert(finalState.resolveParameterBindings("$identifier")("$identifierInner").isEmpty)

        assert(finalState.resolveParameterBindings("$UnboundId").size == 1)
        assert(finalState.resolveParameterBindings("$UnboundId")("$identifierInner").isEmpty)

        assert(finalState.resolveParameterBindings("$Id").size == 1)
        assert(finalState.resolveParameterBindings("$Id")("$identifierInner").contains("$string"))

      }
    }

    describe("using list") {
      val commands = Seq(
        AddShape("$ListOfStrings", "$list", "StringList"),
        SetParameterShape(ProviderInShape("$ListOfStrings", ShapeProvider("$string"), "$listItem")),
      )
      it("should resolve bindings to $any when unbound and whatever was bound when bound") {
        val (events, finalState) = fixture(commands)

        assert(finalState.resolveParameterBindings("$list").size == 1)
        assert(finalState.resolveParameterBindings("$list")("$listItem").isEmpty)

        assert(finalState.resolveParameterBindings("$ListOfStrings").size == 1)
        assert(finalState.resolveParameterBindings("$ListOfStrings")("$listItem").contains("$string"))
      }
    }
  }

  describe("Fields") {
    describe("invalid field context") {
      it("should fail to add a field to a non-object") {
        val commands = Seq(
          AddShape("$notAnObject", "$string", "Not an Object"),
          AddField("$someField", "$notAnObject", "some field", FieldShapeFromShape("$someField", "$any"))
        )

        assertThrows[IllegalArgumentException] {
          val (events, finalState) = fixture(commands)
        }

      }
    }
    describe("valid field context") {
      it("should not fail to add a field to an object") {
        val commands = Seq(
          AddShape("$anObject", "$object", "An Object"),
          AddField("$someField", "$anObject", "some field", FieldShapeFromShape("$someField", "$string"))
        )

        val (events, finalState) = fixture(commands)
        assert(finalState.resolveCoreShapeIdForField("$someField") == "$string")
      }
    }
    describe("using identifier") {
      it("should resolve something that was bound before being used in a field") {
        val commands = Seq(
          AddShape("$Id", "$identifier", "ID"),
          SetParameterShape(ProviderInShape("$Id", ShapeProvider("$string"), "$identifierInner")),
          AddShape("$anObject", "$object", "An Object"),
          AddField("$f1", "$anObject", "field 1", FieldShapeFromShape("$f1", "$Id")),
          AddField("$f2", "$anObject", "field 2", FieldShapeFromShape("$f2", "$identifier")),
        )

        val (events, finalState) = fixture(commands)
        assert(finalState.resolveParameterBindings("$identifier")("$identifierInner").isEmpty)

        assert(finalState.resolveParameterBindingsForField("$f1").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f1")("$identifierInner").contains(ShapeProvider("$string")))

        assert(finalState.resolveParameterBindingsForField("$f2").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f2")("$identifierInner").isEmpty)
      }
      it("should resolve something that was bound after being used in a field") {
        val commands = Seq(
          AddShape("$Id", "$identifier", "ID"),
          AddShape("$anObject", "$object", "An Object"),
          AddField("$f1", "$anObject", "field 1", FieldShapeFromShape("$f1", "$identifier")),
          AddField("$f2", "$anObject", "field 2", FieldShapeFromShape("$f2", "$identifier")),
          SetParameterShape(ProviderInField("$f1", ShapeProvider("$string"), "$identifierInner")),
        )

        val (events, finalState) = fixture(commands)
        assert(finalState.resolveParameterBindings("$identifier")("$identifierInner").isEmpty)

        assert(finalState.resolveParameterBindingsForField("$f1").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f1")("$identifierInner").contains(ShapeProvider("$string")))

        assert(finalState.resolveParameterBindingsForField("$f2").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f2")("$identifierInner").isEmpty)
      }
    }

    describe("using list") {
      val commands = Seq(
        AddShape("$anObject", "$object", "An Object"),
        AddField("$f1", "$anObject", "field 1", FieldShapeFromShape("$f1", "$list")),
        AddField("$f2", "$anObject", "field 2", FieldShapeFromShape("$f2", "$list")),
        SetParameterShape(ProviderInField("$f1", ShapeProvider("$string"), "$listItem")),
      )
      it("should resolve bindings to $any when unbound and whatever was bound when bound") {
        val (events, finalState) = fixture(commands)

        assert(finalState.resolveParameterBindings("$list").size == 1)
        assert(finalState.resolveParameterBindings("$list")("$listItem").isEmpty)

        assert(finalState.resolveParameterBindingsForField("$f1").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f1")("$listItem").contains(ShapeProvider("$string")))

        assert(finalState.resolveParameterBindingsForField("$f2").size == 1)
        assert(finalState.resolveParameterBindingsForField("$f2")("$listItem").isEmpty)
      }
    }
  }


  describe("pagination wrapper scenario") {
    val commands = Seq(
      AddShape("$Id", "$identifier", "ID"),
      SetParameterShape(ProviderInShape("$Id", ShapeProvider("$string"), "$identifierInner")),

      AddShape("$Account", "$object", "Account"),
      AddShape("$AccountId", "$reference", "Account ID"),
      SetParameterShape(ProviderInShape("$AccountId", ShapeProvider("$Account"), "$referenceInner")),

      AddShape("$User", "$object", "User"),
      AddShape("$UserId", "$reference", "User ID"),
      SetParameterShape(ProviderInShape("$UserId", ShapeProvider("$User"), "$referenceInner")),

      AddField("$Account.id", "$Account", "id", FieldShapeFromShape("$Account.id", "$AccountId")),
      AddField("$Account.userIds", "$Account", "userIds", FieldShapeFromShape("$Account.userIds", "$list")),
      SetParameterShape(ProviderInField("$Account.userIds", ShapeProvider("$UserId"), "$listItem")),

      AddField("$User.id", "$User", "id", FieldShapeFromShape("$User.id", "$string")),
      AddField("$User.name", "$User", "name", FieldShapeFromShape("$User.name", "$string")),
      AddField("$User.accountId", "$User", "accountId", FieldShapeFromShape("$User.accountId", "$AccountId")),

      AddShape("$PaginationWrapper", "$object", "PaginationWrapper"),
      AddShapeParameter("$PaginationWrapper.T", "$PaginationWrapper", "T"),
      AddField("$PaginationWrapper.offset", "$PaginationWrapper", "offset", FieldShapeFromShape("$PaginationWrapper.offset", "$number")),
      AddField("$PaginationWrapper.items", "$PaginationWrapper", "items", FieldShapeFromShape("$PaginationWrapper.items", "$list")),
      SetParameterShape(ProviderInField("$PaginationWrapper.items", ParameterProvider("$PaginationWrapper.T"), "$listItem")),

      AddShape("$UserListResponse1", "$PaginationWrapper", "User List Response 1"),
      SetParameterShape(ProviderInShape("$UserListResponse1", ShapeProvider("$User"), "$PaginationWrapper.T")),

      AddShape("$UserListResponse2", "$PaginationWrapper", "User List Response 2"),

      AddShape("$UserListResponse3", "$PaginationWrapper", "User List Response 3"),
      AddShapeParameter("$UserListResponse3.X", "$UserListResponse3", "X"),
      AddShapeParameter("$UserListResponse3.Y", "$UserListResponse3", "Y"),
      SetParameterShape(ProviderInShape("$UserListResponse3", ParameterProvider("$UserListResponse3.X"), "$PaginationWrapper.T")),
      AddField("$UserListResponse3.item", "$UserListResponse3", "item", FieldShapeFromParameter("$UserListResponse3.item", "$UserListResponse3.Y"))
    )

    it("should allow the creation of a reusable paginated list wrapper") {
      val (events, finalState) = fixture(commands)
      val namedShapesProjection = NamedShapes.fromEvents(events)
      assert(namedShapesProjection("$Id").name == "ID")
      assert(namedShapesProjection("$Account").name == "Account")
      assert(namedShapesProjection("$User").name == "User")
      assert(namedShapesProjection("$AccountId").name == "Account ID")
      assert(!namedShapesProjection.contains("$Account.userIds"))
      assert(finalState.resolveCoreShapeId("$Id") == "$identifier")
      assert(finalState.resolveCoreShapeId("$Account") == "$object")

      assert(finalState.resolveParameterBindings("$AccountId")("$referenceInner").contains("$Account"))
      assert(finalState.resolveParameterBindings("$UserId")("$referenceInner").contains("$User"))
      assert(finalState.resolveCoreShapeId("$User") == "$object")

      assert(finalState.resolveParameterBindingsForField("$Account.userIds")("$listItem").contains(ShapeProvider("$UserId")))
      assert(finalState.resolveCoreShapeId("$UserId") == "$reference")

      assert(finalState.resolveCoreShapeIdForField("$PaginationWrapper.items") == "$list")
      assert(finalState.resolveParameterBindingsForField("$PaginationWrapper.items").size == 1)
      assert(finalState.resolveParameterBindingsForField("$PaginationWrapper.items")("$listItem").contains(ParameterProvider("$PaginationWrapper.T")))

      assert(finalState.resolveParameterBindings("$UserListResponse1").size == 1)
      assert(finalState.resolveParameterBindings("$UserListResponse1")("$PaginationWrapper.T").contains("$User"))

      assert(finalState.resolveParameterBindings("$UserListResponse2").size == 1)
      assert(finalState.resolveParameterBindings("$UserListResponse2")("$PaginationWrapper.T").isEmpty)

      assert(finalState.flattenedShape("$identifier") == FlattenedShape(
        "$identifier", "Identifier",
        "$identifier", "$identifier",
        Seq(Parameter("$identifierInner", "T", isRemoved = false)),
        Map("$identifierInner" -> None),
        Seq.empty,
        isRemoved = false
      ))
      assert(finalState.flattenedShape("$Id") == FlattenedShape(
        "$Id", "ID",
        "$identifier", "$identifier",
        Seq.empty,
        Map("$identifierInner" -> Some(ShapeProvider("$string"))),
        Seq.empty,
        isRemoved = false)
      )
      assert(finalState.flattenedShape("$Account") == FlattenedShape(
        "$Account", "Account",
        "$object", "$object",
        Seq.empty,
        Map.empty,
        Seq(
          FlattenedField("$Account.id", "id", FieldShapeFromShape("$Account.id", "$AccountId"), Map("$referenceInner" -> Some(ShapeProvider("$Account"))), isRemoved = false),
          FlattenedField("$Account.userIds", "userIds", FieldShapeFromShape("$Account.userIds", "$list"), Map("$listItem" -> Some(ShapeProvider("$UserId"))), isRemoved = false)
        ),
        isRemoved = false
      ))

      assert(finalState.flattenedShape("$PaginationWrapper") == FlattenedShape(
        "$PaginationWrapper", "PaginationWrapper",
        "$object", "$object",
        Seq(Parameter("$PaginationWrapper.T", "T", isRemoved = false)),
        Map("$PaginationWrapper.T" -> None),
        Seq(
          FlattenedField("$PaginationWrapper.items", "items", FieldShapeFromShape("$PaginationWrapper.items", "$list"), Map("$listItem" -> Some(ParameterProvider("$PaginationWrapper.T"))), isRemoved = false),
          FlattenedField("$PaginationWrapper.offset", "offset", FieldShapeFromShape("$PaginationWrapper.offset", "$number"), Map.empty, isRemoved = false)
        ),
        isRemoved = false
      ))

      assert(finalState.flattenedShape("$UserListResponse1") == FlattenedShape(
        "$UserListResponse1", "User List Response 1",
        "$PaginationWrapper", "$object",
        Seq.empty,
        Map("$PaginationWrapper.T" -> Some(ShapeProvider("$User"))),
        Seq.empty,
        isRemoved = false
      ))
    }
  }
}
