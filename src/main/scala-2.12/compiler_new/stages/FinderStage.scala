package compiler_new.stages

import cognitro.parsers.GraphUtils.Path.WalkablePath
import compiler_new.errors.{ErrorAccumulator, InvalidComponents, SyntaxError}
import compiler_new.{FinderStageOutput, SnippetStageOutput}
import sdk.descriptions.Finders.{Finder, FinderPath}
import sdk.descriptions.{Component, Lens}

import scala.util.{Failure, Success, Try}

class FinderStage(snippetStageOutput: SnippetStageOutput)(implicit val lens: Lens, errorAccumulator: ErrorAccumulator = new ErrorAccumulator) extends CompilerStage[FinderStageOutput] {
  override def run: FinderStageOutput = {

    implicit val evaluatedFinderPaths = scala.collection.mutable.Map[Finder, FinderPath]()

    val finderPaths = lens.components.map(c=> {
      val finderPathTry = pathForFinder(c.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (c, finderPathTry.get)
    }).filterNot(_ == null)

    if (finderPaths.size != lens.components.size) {
      val invalidComponents = lens.components.toSet diff finderPaths.map(_._1).toSet
      throw new InvalidComponents(invalidComponents)
    }

    val combinedRules = lens.rules ++ lens.components.flatMap(_.rules)

    val rulePaths = combinedRules.map(r=> {
      val finderPathTry = pathForFinder(r.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (r, finderPathTry.get)
    }).filterNot(_ == null)

    val componentsGrouped = finderPaths.groupBy(_._2).mapValues(_.map(_._1))
    val rulesGrouped      = rulePaths.groupBy(_._2).mapValues(_.map(_._1))

    FinderStageOutput(componentsGrouped, rulesGrouped)

  }

  def pathForFinder(finder: Finder)(implicit evaluatedFinderPaths: scala.collection.mutable.Map[Finder, FinderPath] = scala.collection.mutable.Map[Finder, FinderPath]()) : Try[FinderPath] = {
    //no need to evaluate things more than once. Each finder has a distinct finderpath so this lookup is faster.
    if (evaluatedFinderPaths.get(finder).isDefined) return Success(evaluatedFinderPaths.get(finder).get)

    val result = Try(finder.evaluateFinderPath(snippetStageOutput))

    if (result.isSuccess) {
      evaluatedFinderPaths.put(finder, result.get)
    }

    result
  }

}
