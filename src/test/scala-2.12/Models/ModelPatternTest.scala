package Models

import nashorn.scriptobjects.models._
import org.scalatest.{FunSpec, FunSuite}
import play.api.libs.json._

class ModelPatternTest extends FunSpec {

  describe("String patterns") {
    val emailRegex = "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

    it("Should only match JsString objects") {
      val stringPattern = StringPattern()
      assert(!stringPattern.evaluate(JsNumber(13)))
      assert(stringPattern.evaluate(JsString("Hello World")))
    }

    it("Should match anything if no constraints are added") {
      val stringPattern = StringPattern()
      val r = new scala.util.Random()
      1 to 30 foreach { i => assert(stringPattern.evaluate(JsString(r.nextString(i)))) }
    }

    describe("that define regex") {
      val stringPatternWithRegex = StringPattern(regex = emailRegex)
      it("Should match") {
        assert(stringPatternWithRegex.evaluate(JsString("test@testsite.com")))
        assert(stringPatternWithRegex.evaluate(JsString("test2@testsite.com")))
      }

      it("Should not match") {
        assert(!stringPatternWithRegex.evaluate(JsString(" __INVALID ")))
      }

      describe("and length constraints") {
        val stringPatternWithRegexAndMaxLength = StringPattern(maxLength= 10, regex = emailRegex)

        it("Should match") {
          assert(stringPatternWithRegexAndMaxLength.evaluate(JsString("a@b.com")))
        }

        it("Should not match") {
          assert(!stringPatternWithRegexAndMaxLength.evaluate(JsString("a@bcdefghij.com")))
        }
      }

    }

    describe("that define length constraints") {

      val maxLengthStringPattern = StringPattern(maxLength = 10)
      val minLengthStringPattern = StringPattern(minLength = 2)

      it("Should match a max length") {
        assert(maxLengthStringPattern.evaluate(JsString("0123456789")))
        assert(maxLengthStringPattern.evaluate(JsString("ABCDEFGHIJ")))
      }

      it("Should not match a max length") {
        assert(!maxLengthStringPattern.evaluate(JsString("012345678910")))
        assert(!maxLengthStringPattern.evaluate(JsString("ABCDEFGHIJK")))
      }

      it("Should match a min length") {
        assert(minLengthStringPattern.evaluate(JsString("0123")))
        assert(minLengthStringPattern.evaluate(JsString("ABCDEFG")))
        assert(minLengthStringPattern.evaluate(JsString("01")))
      }

      it("Should not match a min length") {
        assert(!minLengthStringPattern.evaluate(JsString("0")))
        assert(!minLengthStringPattern.evaluate(JsString("")))
      }

    }

  }

  describe("Number pattern") {

    describe("when equal is used") {

      it("Should throw if any others are defined") {
        assertThrows[Error] {
          NumberValuePattern(equalTo = 5, lte = 15)
        }
        assertThrows[Error] {
          NumberValuePattern(equalTo = 5, gte = 15)
        }
        assertThrows[Error] {
          NumberValuePattern(equalTo = 5, gt = 15)
        }
        assertThrows[Error] {
          NumberValuePattern(equalTo = 5, lt = 15)
        }

        assertThrows[Error] {
          NumberValuePattern(equalTo = 5, lte = 15, lt=5)
        }

      }

      it("Should match only if value matches") {
        assert(NumberValuePattern(equalTo = 5).evaluate(JsNumber(5)))
        assert(NumberValuePattern(equalTo = 11).evaluate(JsNumber(11)))
        assert(!NumberValuePattern(equalTo = 2400).evaluate(JsNumber(16)))
        assert(!NumberValuePattern(equalTo = 3200).evaluate(JsNumber(9242)))
      }

    }

    describe("when gt or lt used") {
      it("Should throw when both are defined") {
        assertThrows[Error] {
          NumberValuePattern(gt = 5, gte = 15)
        }
      }

      describe("Should work when one or the other is defined") {

        describe("when gt is defined") {
          val pattern = NumberValuePattern(gt = 5)

          it("Should match") {
            assert(pattern.evaluate(JsNumber(6)))
            assert(pattern.evaluate(JsNumber(9)))
            assert(pattern.evaluate(JsNumber(3000)))
          }

          it("Should not match") {
            assert(!pattern.evaluate(JsNumber(5)))
            assert(!pattern.evaluate(JsNumber(4)))
            assert(!pattern.evaluate(JsNumber(0)))
          }

        }
        describe("when gte is defined") {
          val pattern = NumberValuePattern(gte = 5)

          it("Should match") {
            assert(pattern.evaluate(JsNumber(5)))
            assert(pattern.evaluate(JsNumber(9)))
            assert(pattern.evaluate(JsNumber(3000)))
          }

          it("Should not match") {
            assert(!pattern.evaluate(JsNumber(4)))
            assert(!pattern.evaluate(JsNumber(2)))
            assert(!pattern.evaluate(JsNumber(0)))
          }
        }
      }

    }

    describe("when lt or lte used") {
      it("Should throw when both are defined") {
        assertThrows[Error] {
          NumberValuePattern(lt = 5, lte = 15)
        }
      }

      describe("Should work when one or the other is defined") {

        describe("when lt is defined") {
          val pattern = NumberValuePattern(lt = 5)

          it("Should match") {
            assert(pattern.evaluate(JsNumber(4)))
            assert(pattern.evaluate(JsNumber(2)))
            assert(pattern.evaluate(JsNumber(0)))
          }

          it("Should not match") {
            assert(!pattern.evaluate(JsNumber(5)))
            assert(!pattern.evaluate(JsNumber(10)))
            assert(!pattern.evaluate(JsNumber(300)))
          }

        }
        describe("when lte is defined") {
          val pattern = NumberValuePattern(lte = 5)

          it("Should match") {
            assert(pattern.evaluate(JsNumber(5)))
            assert(pattern.evaluate(JsNumber(2)))
            assert(pattern.evaluate(JsNumber(0)))
          }

          it("Should not match") {
            assert(!pattern.evaluate(JsNumber(10)))
            assert(!pattern.evaluate(JsNumber(6)))
            assert(!pattern.evaluate(JsNumber(800)))
          }
        }
      }

    }

  }

  describe("Value patters") {

    val valuePattern1 = ValuePattern(JsString("Hello"))
    val valuePattern2 = ValuePattern(JsNumber(12))
    val valuePattern3 = ValuePattern(JsObject(Seq("hey"-> JsString("you"))))

    it("Should match same values") {
      assert(valuePattern1.evaluate(JsString("Hello")))
      assert(valuePattern2.evaluate(JsNumber(12)))
      assert(valuePattern3.evaluate(JsObject(Seq("hey"-> JsString("you")))))
    }

    it("Should reject different values") {
      assert(!valuePattern1.evaluate(JsString("Lancelot")))
      assert(!valuePattern1.evaluate(JsNumber(5)))
      assert(!valuePattern2.evaluate(JsNumber(4)))
      assert(!valuePattern3.evaluate(JsObject(Seq("coco"-> JsString("rat")))))
    }

  }

  describe("ModelPattern") {

    val testObject = JsObject(Seq(
      "title" -> JsString("Boss"),
      "name"  -> JsObject(Seq(
        "first" -> JsString("John"),
        "last" -> JsString("Smith")
      ))
    ))


    it("Should match certain models") {
      assert(
        ModelPattern(
          FieldPattern("name.first", ValuePattern(JsString("John"))),
          FieldPattern("name.last", ValuePattern(JsString("Smith"))),
          FieldPattern("title", ValuePattern(JsString("Boss")))
        ).evaluate(testObject)
      )
    }

    it("Should not match certain models") {
      assert(!
        ModelPattern(
          FieldPattern("name.first", ValuePattern(JsString("John"))),
          FieldPattern("name.last", ValuePattern(JsString("Smith"))),
          FieldPattern("title", ValuePattern(JsString("Will")))
        ).evaluate(testObject)
      )
    }

  }

  describe("ModelPattern initialization from JS") {

    describe("Accepts the right input") {
      it("Should accept JsObjects") {
        val jsObject = Json.parse("{ \"name.first\": \"John\" }")
        ModelPattern.fromJs(jsObject)
      }

      it("Should not accept anything else") {
        assertThrows[Error] {
          ModelPattern.fromJs(JsString("Hello"))
        }
        assertThrows[Error] {
          ModelPattern.fromJs(JsNumber(15))
        }

      }
    }

    describe("When creating a valid JsModel from Js values") {

      def parseToModel(string: String) = {
        val jsObject = Json.parse(string)
        ModelPattern.fromJs(jsObject)
      }

      it("Should create a model with one field for each key entry") {

        assert(parseToModel("{ \"name.first\": \"John\" }").fieldPatterns.size == 1)
        assert(parseToModel("{ \"name.first\": \"John\",  \"name.last\": \"Smith\" }").fieldPatterns.size == 2)
        assert(parseToModel("{ \"name.first\": \"John\",  \"name.first\": \"Smith\" }").fieldPatterns.size == 1)
        assert(parseToModel("{ }").fieldPatterns.size == 0)

      }

      describe("Should define the right field pattern") {

        it("Should work for value equality checks") {
          assert(ModelPattern.fieldPatternFromJs(JsString("Hello")) == ValuePattern(JsString("Hello")))
          assert(ModelPattern.fieldPatternFromJs(JsNumber(15)) == ValuePattern(JsNumber(15)))
          assert(ModelPattern.fieldPatternFromJs(JsBoolean(true)) == ValuePattern(JsBoolean(true)))
          assert(ModelPattern.fieldPatternFromJs(JsNull) == ValuePattern(JsNull))
        }

        it("Should work for number patterns") {
          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$gt"-> JsNumber(5))
          )) == NumberValuePattern(gt = 5))

          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$lt"-> JsNumber(5), "$gt"-> JsNumber(2))
          )) == NumberValuePattern(lt = 5, gt = 2 ))

          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$equalTo"-> JsNumber(5))
          )) == NumberValuePattern(equalTo = 5))

        }

        it("Should work for string patterns") {

          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$minLength"-> JsNumber(5))
          )) == StringPattern(minLength = 5))

          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$regex"-> JsString("test"))
          )) == StringPattern(regex = "test"))
//
          assert(ModelPattern.fieldPatternFromJs(JsObject(
            Seq("$maxLength"-> JsNumber(9))
          )) == StringPattern(maxLength = 9))

        }

      }

    }


  }
}
