package compiler_new

import compiler_new.errors.{CompilerException, ErrorAccumulator}
import compiler_new.stages.{FinderStage, ParserFactoryStage, SnippetStage, ValidationStage}
import sdk.SdkDescription
import sdk.descriptions.{Lens, Schema}
import sourcegear.Gear

import scala.collection.mutable.ListBuffer
import scala.util.Try

object Compiler {
  def setup(sdkDescription: SdkDescription) : CompilerPool = {

    implicit val schemas: Vector[Schema] = sdkDescription.schemas
    implicit val lenses: Vector[Lens] = sdkDescription.lenses
    implicit val errorAccumulator: ErrorAccumulator = new ErrorAccumulator

    new CompilerPool(sdkDescription.lenses.map(l=> new CompileWorker(l)).toSet)
  }

  class CompilerPool(val compilers: Set[CompileWorker]) {

    private implicit var completed: ListBuffer[Output] = new scala.collection.mutable.ListBuffer[Output]()

    private def clear = completed = new scala.collection.mutable.ListBuffer[Output]()

    def execute()(implicit schemas: Vector[Schema], lenses: Vector[Lens], errorAccumulator: ErrorAccumulator): Set[FinalOutput] = {
      clear
      compilers.par.map(_.compile).seq
    }
  }

  class CompileWorker(sourceLens: Lens) {
    def compile()(implicit schemas: Vector[Schema], lenses: Vector[Lens], completed: ListBuffer[Output], errorAccumulator: ErrorAccumulator = new ErrorAccumulator): FinalOutput = {
      implicit val lens = sourceLens

      //@todo reorder this / abstract. Looks very dirty.

      val validationOutput = new ValidationStage().run

      //Find the right parser and snippets into an AST Tree Graph
      val snippetBuilder = new SnippetStage(lens.snippet)
      val snippetOutput = Try(snippetBuilder.run)

      //snippet stage must succeed for anything else to happen.
      if (snippetOutput.isSuccess) {
        val finderStage = new FinderStage(snippetOutput.get)
        val finderStageOutput = Try(finderStage.run)

        if (finderStageOutput.isSuccess) {
          val parser = Try(new ParserFactoryStage(snippetOutput.get, finderStageOutput.get).run)

          //          val mutater = new ParserFactoryStage()
          //          val generator = new ParserFactoryStage()

          if (parser.isSuccess) {
            val finalGear = Gear(snippetOutput.get.enterOn, parser.get.parseGear, null, null)
            //@todo add check (match self, ...)

            return Success(finalGear)
          } else {
            errorAccumulator.handleFailure(parser.failed)
          }

        } else {
          errorAccumulator.handleFailure(finderStageOutput.failed)
        }

      } else {
        errorAccumulator.handleFailure(snippetOutput.failed)
      }

      Failure(lens, errorAccumulator)
    }
  }

}
