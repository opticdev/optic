package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.{FinderStageOutput, SnippetStageOutput}
import com.opticdev.core.compiler.errors.{ErrorAccumulator, InvalidComponents}
import com.opticdev.core.sdk.descriptions.Lens
import com.opticdev.core.sdk.descriptions.finders.{Finder, FinderPath}

import scala.util.{Failure, Success, Try}

class FinderStage(snippetStageOutput: SnippetStageOutput)(implicit val lens: Lens, errorAccumulator: ErrorAccumulator = new ErrorAccumulator) extends CompilerStage[FinderStageOutput] {
  override def run: FinderStageOutput = {

    import com.opticdev.core.sdk.descriptions.helpers.ComponentImplicits._

    implicit val evaluatedFinderPaths = scala.collection.mutable.Map[Finder, FinderPath]()

    val finderPaths = lens.components.codeComponents.map(c=> {
      val finderPathTry = pathForFinder(c.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (c, finderPathTry.get)
    }).filterNot(_ == null)

    if (finderPaths.size != lens.components.codeComponents.size) {
      val invalidComponents = lens.components.codeComponents.toSet diff finderPaths.map(_._1).toSet
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
