package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.{FinderError, FinderStageOutput, SnippetStageOutput}
import com.opticdev.core.compiler.errors.{ErrorAccumulator, InvalidComponents}
import com.opticdev.core.compiler.helpers.{FinderEvaluator, FinderPath}
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.sdk.descriptions.{CodeComponent, Lens}
import com.opticdev.sdk.descriptions.enums.{Literal, ObjectLiteral, Token}
import com.opticdev.sdk.descriptions.finders.Finder

import scala.collection.immutable
import scala.util.{Failure, Success, Try}

class FinderStage(snippetStageOutput: SnippetStageOutput)(implicit val lens: Lens, errorAccumulator: ErrorAccumulator = new ErrorAccumulator, variableManager: VariableManager = VariableManager.empty, subcontainersManager: SubContainerManager = SubContainerManager.empty, debug: Boolean = false) extends CompilerStage[FinderStageOutput] {
  override def run: FinderStageOutput = {

    import com.opticdev.sdk.descriptions.helpers.ComponentImplicits._

    implicit val evaluatedFinderPaths = scala.collection.mutable.Map[Finder, FinderPath]()

    val evaluated = lens.components.codeComponents.map(c=> {
      val finderPathTry = pathForFinder(c.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        val errorString = finderPathTry.asInstanceOf[Failure[Exception]].exception.toString
        FinderError(c, errorString)
      } else {
        val finderPath = finderPathTry.get

        val typedComponent = finderPath match {
          case x if x.leadsToLiteral => c.withComponentType(Literal)
          case x if x.leadsToToken => c.withComponentType(Token)
          case x if x.leadsToObjectLiteral => c.withComponentType(ObjectLiteral)
          case _ => c
        }

        (typedComponent, finderPathTry.get)
      }
    })


    val finderPaths = evaluated.collect {
      case a: (CodeComponent, FinderPath) => a
    }

    val invalidComponents = evaluated.collect {
      case a: FinderError => a
    }

    //do not interrupt when in debug mode
    if (invalidComponents.nonEmpty && !debug) {
      throw new InvalidComponents(invalidComponents.map(_.codeComponent))
    }

    val variableRules = variableManager.rules(snippetStageOutput)

    val subContainerRules = subcontainersManager.rules

    val combinedRules = /* lens.rules ++ */ lens.components.flatMap(_.rules) ++ variableRules ++ subContainerRules

    val rulePaths = combinedRules.map(r=> {
      val finderPathTry = pathForFinder(r.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (r, finderPathTry.get)
    }).filterNot(_ == null)

    val componentsGrouped = finderPaths.groupBy(_._2).mapValues(_.map(_._1))
    val rulesGrouped      = rulePaths.groupBy(_._2).mapValues(_.map(_._1))

    FinderStageOutput(componentsGrouped, rulesGrouped, invalidComponents)

  }

  def pathForFinder(finder: Finder)(implicit evaluatedFinderPaths: scala.collection.mutable.Map[Finder, FinderPath] = scala.collection.mutable.Map[Finder, FinderPath]()) : Try[FinderPath] = {
    //no need to evaluate things more than once. Each finder has a distinct finderpath so this lookup is faster.
    if (evaluatedFinderPaths.get(finder).isDefined) return Success(evaluatedFinderPaths(finder))

    val result = Try(FinderEvaluator.finderPath(finder,snippetStageOutput))

    if (result.isSuccess) {
      evaluatedFinderPaths.put(finder, result.get)
    }

    result
  }

}
