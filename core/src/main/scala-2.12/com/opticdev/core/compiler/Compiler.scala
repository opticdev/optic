package com.opticdev.core.compiler

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.compiler.errors.ErrorAccumulator
import com.opticdev.core.compiler.stages.{FinderStage, _}
import com.opticdev.core.sourcegear.{CompiledLens, SGExportableLens}
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.context.{FlatContext, FlatContextBuilder, SDKObjectsResolvedImplicits}
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.opm.context.{Context, PackageContext}
import com.opticdev.opm.DependencyTree
import com.opticdev.opm.packages.OpticMDPackage
import com.opticdev.sdk.opticmarkdown2.lens.OMLens

import scala.collection.mutable.ListBuffer
import scala.util.Try

object Compiler {
  def setup(opticPackage: OpticMDPackage)(implicit logToCli: Boolean = false, dependencyTree: DependencyTree) : CompilerPool = {

    implicit val packageContext = dependencyTree.treeContext(opticPackage.packageFull).get

    implicit val errorAccumulator: ErrorAccumulator = new ErrorAccumulator

    new CompilerPool(opticPackage, opticPackage.lenses.map(l=> new CompileWorker(l)).toSet)
  }

  class CompilerPool(opticPackage: OpticMDPackage, val compilers: Set[CompileWorker])(implicit packageContext: Context, dependencyTree: DependencyTree, errorAccumulator: ErrorAccumulator, logToCli: Boolean = false) {

    private implicit var completed: ListBuffer[Output] = new scala.collection.mutable.ListBuffer[Output]()

    private def clear = completed = new scala.collection.mutable.ListBuffer[Output]()

    def execute: CompilerOutput = {
      clear
      //@todo par should ideally be used here, but it is inconsistent for some reason. need to look into race conditions
      CompilerOutput(opticPackage, compilers.map(_.compile).seq, dependencyTree.flattenSchemas)
    }
  }

  class CompileWorker(sourceLens: OMLens) {
    def compile()(implicit packageContext: Context, completed: ListBuffer[Output] = ListBuffer(), errorAccumulator: ErrorAccumulator = new ErrorAccumulator, debug: Boolean = false): LensCompilerOutput = {
      implicit val lens = sourceLens

      //@todo reorder this / abstract. Looks very dirty.

      val validationOutput = new ValidationStage().run

      //Find the right parser and snippets into an AST Tree Graph
      val snippetBuilder = new SnippetStage(lens.snippet)
      val snippetOutput = Try(snippetBuilder.run)
      if (snippetOutput.isSuccess) {
        implicit val variableManager = new VariableManager(lens.variablesCompilerInput, snippetOutput.get.parser.identifierNodeDesc)
        implicit val subcontainersManager = new SubContainerManager(lens.subcontainerCompilerInputs, snippetOutput.get.containerMapping)

        val qualifySchema = (pr: PackageRef, sr: SchemaRef) => {
          SDKObjectsResolvedImplicits.qualifySchema(pr, sr)
        }

        snippetOutput.get.matchType match {
          case MatchType.Single => {
            val compiledTry = for {
              snippet <- snippetOutput
              finderStageOutput <- Try(new FinderStage(snippet).run)
              parser <- Try(new ParserFactoryStage(snippet, finderStageOutput, qualifySchema).run)
              renderer <- Try(new RenderFactoryStage(snippetOutput.get, parser.parseGear).run)
              compiledLens <- Try(CompiledLens(lens.name, lens.id, lens.packageRef, lens.schema, snippetOutput.get.enterOn, parser.parseGear.asInstanceOf[ParseAsModel], renderer.renderGear))
            } yield compiledLens

            if (compiledTry.isSuccess) {
              Success(sourceLens, compiledTry.get, if (debug) Some(DebugOutput(validationOutput, snippetOutput, Try(new FinderStage(snippetOutput.get).run), variableManager)) else None)
            } else {
              errorAccumulator.handleFailure(compiledTry.failed)
              Failure(lens, errorAccumulator)
            }
          }

          case MatchType.Multi => {
            val compiledTry = Try(new MultiNodeParserFactoryStage(snippetOutput.get, qualifySchema).run)
            if (compiledTry.isSuccess) {
              Success(sourceLens, compiledTry.get.asInstanceOf[SGExportableLens], if (debug) Some(DebugOutput(validationOutput, snippetOutput, Try(new FinderStage(snippetOutput.get).run), variableManager)) else None)
            } else {
              errorAccumulator.handleFailure(compiledTry.failed)
              Failure(lens, errorAccumulator)
            }
          }
        }

      } else {
        Failure(lens, errorAccumulator)
      }
    }
  }

}
