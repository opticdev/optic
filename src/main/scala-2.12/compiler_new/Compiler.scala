package compiler_new

import compiler_new.errors.{CompilerError, ErrorAccumulator}
import compiler_new.stages.SnippetBuilder
import sdk.SdkDescription
import sdk.descriptions.{Lens, Schema}

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

    def execute()(implicit schemas: Vector[Schema], lenses: Vector[Lens], errorAccumulator: ErrorAccumulator): Set[Output] = {
      clear
      compilers.par.map(_.compile).seq
    }
  }

  class CompileWorker(lens: Lens) {
    def compile()(implicit schemas: Vector[Schema], lenses: Vector[Lens], completed: ListBuffer[Output], errorAccumulator: ErrorAccumulator = new ErrorAccumulator): Output = {

      //Find the right parser and snippets into an AST Tree Graph
      val snippetBuilder = new SnippetBuilder(lens, lens.snippet)
      val snippetOutput = Try(snippetBuilder.run)



      null
    }
  }

}
