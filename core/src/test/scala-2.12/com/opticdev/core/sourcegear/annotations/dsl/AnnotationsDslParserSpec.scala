package com.opticdev.core.sourcegear.annotations.dsl

import better.files.File
import com.opticdev.core.sourcegear.annotations.dsl.AnnotationsDslParser.Regexes
import joptsimple.util.KeyValuePair
import org.scalatest.FunSpec
import play.api.libs.json.{JsBoolean, JsNumber, JsString, Json}

import scala.util.matching.Regex

class AnnotationsDslParserSpec extends FunSpec {

  describe("single line") {

    implicit val parseContext = ParseContext(File("test"), 0)

    describe("set operation") {

      it("can extract") {
        val input = "optic.set key = true"
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get == SetOperationNode(Vector(
          AssignmentNode(Seq("key"), Some(JsBoolean(true)))
        )))
      }

      it("can extract a ref") {
        val input = "optic.set key = (Hello World)"
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get == SetOperationNode(Vector(
          AssignmentNode(Seq("key"), None, Some("Hello World"))
        )))
      }

      it("can extract with multiple items") {
        val input = "optic.set key = true, otherKey = 123"
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get == SetOperationNode(Vector(
          AssignmentNode(Seq("key"), Some(JsBoolean(true))),
          AssignmentNode(Seq("otherKey"), Some(JsNumber(123)))
        )))
      }

      it("collects errors") {
        val input = "optic.set key = 'string\"" //non-matching closing quote...
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(!parseResult.isSuccess)
        assert(!parseResult.isFailure)
        assert(parseResult.isPartialSuccess)
        assert(parseResult.errors.head.asInstanceOf[KeyValuePairError].jsonError == "Could not parse assignment expression")
      }

    }

    describe("name operation") {

      it("can extract") {
        val input = "optic.name = 'Set My Name To This'    "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get == NameOperationNode("Set My Name To This"))
      }

      it("will fail if invalid") {
        val input = "optic.name  = 123    "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isFailure)
      }
    }

    describe("tag operation") {

      it("can extract") {
        val input = "optic.tag  = \"Query\"    "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get == TagOperationNode("Query"))
      }

      it("will fail if invalid") {
        val input = "optic.tag  123    "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isFailure)
      }
    }

    describe("source operation") {
      it("can extract with project name") {
        val input = "optic.source = \"Project Name\" : \"Object ID\" -> aidan:optic/idll {\"one\": true} "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get.asInstanceOf[SourceOperationNode].name == "Object ID")
        assert(parseResult.get.asInstanceOf[SourceOperationNode].project.contains("Project Name"))
        assert(parseResult.get.asInstanceOf[SourceOperationNode].relationshipId.get.full =="aidan:optic@latest/idll")
        assert(parseResult.get.asInstanceOf[SourceOperationNode].answers.get == Json.parse("""{"one": true}"""))
      }

      it("can extract without project name") {
        val input = "optic.source = \"Object ID\" -> aidan:optic/idll {\"one\": true} "
        val parseResult = AnnotationsDslParser.parseSingleLine(input)
        assert(parseResult.isSuccess)
        assert(parseResult.get.asInstanceOf[SourceOperationNode].name == "Object ID")
        assert(parseResult.get.asInstanceOf[SourceOperationNode].project.isEmpty)
        assert(parseResult.get.asInstanceOf[SourceOperationNode].relationshipId.get.full =="aidan:optic@latest/idll")
        assert(parseResult.get.asInstanceOf[SourceOperationNode].answers.get == Json.parse("""{"one": true}"""))
      }
    }

  }


  describe("regexes") {
    import AnnotationsDslParser.Regexes._
    import RegexHelper._
    describe("helpers") {
      it("optional whitespace") {
        assert(w.matches(""))
        assert(w.matches(" "))
        assert(w.matches("    "))
        assert(!w.matches("    \n"))
        assert(!w.matches("  a "))
      }

      it("required whitespace") {
        assert(W.matches(" "))
        assert(W.matches("   "))
        assert(!W.matches(""))
      }

      it("one of") {
        val a = oneOf(Seq("a", "b"))
        assert(a.matches("a"))
        assert(a.matches("b"))
        assert(!a.matches("c"))
      }

    }

    describe("operations") {
      it("matches") {
        assert(op.matches("optic.set"))
        assert(op.matches("optic   .   name"))
        assert(op.matches("optic   .  source"))
        assert(!op.matches("optic..source"))
        assert(!op.matches("optic.hello"))
      }

      it("extracts") {
        assert(op.extract("optic.set")("operation").contains("set"))
        assert(op.extract("optic.source")("operation").contains("source"))
        assert(op.extract("optic.dddfg")("operation").isEmpty)
      }
    }

    describe("dot notation") {
      it("matches") {
        assert(dotNotation.matches("hello.world"))
        assert(dotNotation.matches("hello.0.world"))

        assert(!dotNotation.matches("hello.0."))
        assert(!dotNotation.matches("."))
        assert(!dotNotation.matches("--hello.me"))
        assert(!dotNotation.matches(""))
      }

      it("extracts key paths") {
        assert(dotNotation.extract("hello.world")("keyPath").get == "hello.world")
      }
    }

    describe("JSON values") {
      it("matches string literals") {
        assert(doubleQuotesString("(.*)*").matches("\"Hello World\""))
        assert(doubleQuotesString("(.*)*").extract("\"Hello World\"")("value").get == "Hello World")
        assert(singleQuotesString("(.*)*").matches("'Hello World'"))
        assert(!singleQuotesString("(.*)*").matches("RAW"))
      }
      it("matches boolean literals") {
        assert(boolean.matches("true"))
        assert(boolean.matches("false"))
        assert(!boolean.matches("othertoken"))
      }

      it("matches number literals") {
        assert(number.matches("234"))
        assert(number.extract("234")("value").get == "234")
        assert(!number.matches("abc"))
      }
    }

    describe("assignment lists") {
      it("matches single item") {
        assignmentListItem.matches("key.value = 'ABC'")
        assignmentListItem.matches("key.value = true")
        assignmentListItem.matches("key.value = (Ref to Object)")
      }

      it("matches a list of assignments with a ref") {
        val list = "first = {\"token\": {}}, hello = (ref to thing)"
        assert(assignmentListParser(list) == Vector(
          KeyValuePair(Seq("first"), Json.parse("""{"token":{}}""")),
          KeyValuePair(Seq("hello"), JsString("ref to thing"), true),
        ))
      }

      it("matches a list of assignments") {
        val list = "first = {\"token\": {}}, key.value = 'you', not.e = \"value\""
        assert(assignmentListParser(list) == Vector(
          KeyValuePair(Seq("first"), Json.parse("""{"token":{}}""")),
          KeyValuePair(Seq("key", "value"), JsString("you")),
          KeyValuePair(Seq("not", "e"), JsString("value")
        )))
      }
    }

    describe("source declarations") {
      it("parses full example") {
        val i = source.extract(" = \"Project Name\" : \"Object ID\" -> aidan:optic/idll {one: true}")(_)
        assert(i("projectName").get == "Project Name")
        assert(i("objectId").get == "Object ID")
        assert(i("relationshipId").get == "aidan:optic/idll")
        assert(i("answers").get == "{one: true}")
      }

      it("parses w/o answers") {
        val i = source.extract("= \"Project Name\" : \"Object ID\" -> aidan:optic/idll")(_)
        assert(i("projectName").get == "Project Name")
        assert(i("objectId").get == "Object ID")
        assert(i("relationshipId").get == "aidan:optic/idll")
      }

      it("parses w/o transformation ID") {
        val i = source.extract("= \"Project Name\" : \"Object ID\"")(_)
        assert(i("projectName").get == "Project Name")
        assert(i("objectId").get == "Object ID")
      }
    }


    it("can read name and tag assignments") {
      assert(nameAndTagAssignment.extract(" = 'My Name'")("quoted").get == "'My Name'")
      assert(!nameAndTagAssignment.matches(" =  123"))
      assert(!nameAndTagAssignment.matches(" =  false"))
    }

    it("single line extracts") {
      val sl = singleLine.extract("optic.set me = 'you'     ")(_)
      assert(sl("operation").contains("set"))
      assert(sl("expression").contains("me = 'you'"))
    }

  }

}