package com.opticdev.core.compiler.stages

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.core.compiler.errors._
import org.scalatest.{FunSpec, PrivateMethodTester}
import com.opticdev.sdk.descriptions.{Lens, Snippet}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.core._
import com.opticdev.core.sourcegear.containers.ContainerHook

import scala.util.Try

class SnippetStageSpec extends TestBase with PrivateMethodTester {

  implicit val lens : Lens = Lens("Example", BlankSchema, null, null, null, null, null)

  describe("Finds the correct parser") {
    it("when it exists") {
      val snippetBuilder = new SnippetStage(Snippet("Javascript", "function add (a, b) { a+b }"))
      assert(snippetBuilder.getParser().languageName == "Javascript")
    }

    it("fails when it does not") {
      val snippetBuilder = new SnippetStage(Snippet("MadeUp", "NOT REAL"))
      assertThrows[ParserNotFound] {
        snippetBuilder.getParser()
      }
    }
  }

  describe("parses snippet") {
    it("if it is valid") {
      val snippetBuilder = new SnippetStage(Snippet("Javascript", "function add (a, b) { a+b }"))
      snippetBuilder.buildAstTree()
    }

    it("fails on snippet errors") {
      assertThrows[SyntaxError] {
        val snippetBuilder = new SnippetStage(Snippet("Javascript", "function whoops { a+b }"))
        snippetBuilder.buildAstTree()
      }
    }

  }

  describe("calculates valid enterOn and MatchType") {

    def parseResult(codeBlock: String) = {
      val snippetBuilder = new SnippetStage(Snippet("Javascript", codeBlock))

      val parser = snippetBuilder.getParser()
      val (ast, root) = snippetBuilder.buildAstTree()

      snippetBuilder.enterOnAndMatchType(ast, root)
    }

    it("for single node snippets") {
      val (enterOn, children, matchType) = parseResult("function add(a, b) { return a+b }")
      assert(enterOn.size == 1 && enterOn.head == AstType("FunctionDeclaration", "Javascript"))
      assert(children.size == 1)
      assert(matchType == MatchType.Parent)
    }

    it("for multi-node snippets") {
      val (enterOn, children, matchType) = parseResult("function subtract(a,b) { return a-b } function add(a,b) { return a+b }")
      val blockNodeTypes = SourceParserManager.parserByLanguageName("Javascript").get.blockNodeTypes
      assert(enterOn.size == 2 && enterOn == blockNodeTypes.nodeTypes)
      assert(children.size == 2)
      assert(matchType == MatchType.Children)
    }

    it("throws on an empty snippet") {
      assertThrows[UnexpectedSnippetFormat] {
        parseResult("//just a comment")
      }
    }

  }

  describe("Extracts possible subcontainers") {

    it("will find the container hooks") {

      val example =
        """
          |function code () {
          |   //:container name
          |   //:container2 name
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      val containerHooks = snippetBuilder.findContainerHooks

      assert(containerHooks == Vector(
        ContainerHook("container name", Range(20, 40)),
        ContainerHook("container2 name", Range(41, 62))
      ))
    }

    it("will throw an error if any of the containers have the same name") {
      val example =
        """
          |function code () {
          |   //:container name
          |   //:container name
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      assertThrows[DuplicateContainerNamesInSnippet] {
        snippetBuilder.findContainerHooks
      }

    }

    it("connects container hooks to compatible ast nodes") {

      val example =
        """
          |function code () {
          |   //:container name
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      val containerHooks = snippetBuilder.findContainerHooks
      val (ast, root) = snippetBuilder.buildAstTree()
      val hookMap = snippetBuilder.connectContainerHooksToAst(containerHooks, ast, root)

      val foundNode = hookMap.head._2
      assert(foundNode.node.nodeType.name == "BlockStatement")
      assert(foundNode.node.range == Range(18, 42))

    }

    it("will throw an error if >1 containers connects to same node") {
      val example =
        """
          |function code () {
          |   //:container1
          |   //:container2
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      val containerHooks = snippetBuilder.findContainerHooks
      val (ast, root) = snippetBuilder.buildAstTree()
      assertThrows[ContainerDefinitionConflict] {
        snippetBuilder.connectContainerHooksToAst(containerHooks, ast, root)
      }

    }

    it("can strip hooks from a snippet") {
      val example =
        """
          |function code () {
          |   if (true) {
          |   //:if true
          |   } else {
          |   //:if false
          |   }
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      val containerHooks = snippetBuilder.findContainerHooks
      val (ast, root) = snippetBuilder.buildAstTree()
      val mapping = snippetBuilder.connectContainerHooksToAst(containerHooks, ast, root)

      val result = snippetBuilder.stripContainerHooks(mapping)

      assert(result.block ===
        """
          |function code () {
          |   if (true) {
          |
          |   } else {
          |
          |   }
          |}
        """.stripMargin)

    }

    it("works end-end") {
      val example =
        """
          |function code () {
          |   if (true) {
          |   //:if true
          |   } else {
          |   //:if false
          |   }
          |}
        """.stripMargin

      val snippetBuilder = new SnippetStage(Snippet("Javascript", example))
      val output = snippetBuilder.run
      assert(output.containerMapping.size == 2)
    }


  }


  it("works end to end") {
    val snippetBuilder = new SnippetStage(Snippet("Javascript", "function add (a, b) { a+b }"))
    val outputTry = Try(snippetBuilder.run)
    assert(outputTry.isSuccess)
  }


}
