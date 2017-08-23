package compiler_new.stages

import cognitro.parsers.GraphUtils.Path.WalkablePath
import compiler_new.errors.{ErrorAccumulator, InvalidComponents, SyntaxError}
import compiler_new.{FinderStageOutput, SnippetStageOutput}
import sdk.descriptions.Finders.FinderPath
import sdk.descriptions.{Component, Lens}

import scala.util.{Failure, Try}

class FinderStage(snippetStageOutput: SnippetStageOutput)(implicit val lens: Lens, errorAccumulator: ErrorAccumulator = new ErrorAccumulator) extends CompilerStage[FinderStageOutput] {
  override def run: FinderStageOutput = {

    val finderPaths = lens.components.map(c=> {
      val finderPathTry = pathForComponent(c)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (c, finderPathTry.get)
    }).filterNot(_ == null).toMap

    if (finderPaths.size != lens.components.size) {
      val invalidComponents = lens.components.toSet diff finderPaths.map(_._1).toSet
      throw new InvalidComponents(invalidComponents)
    }

    FinderStageOutput(snippetStageOutput, finderPaths)
  }

  def pathForComponent(component: Component) : Try[FinderPath] = {
    Try(component.finder.evaluateFinderPath(snippetStageOutput))
  }

}
