package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.{FinderError, FinderStageOutput, SnippetStageOutput}
import com.opticdev.core.compiler.errors.{ErrorAccumulator, InvalidComponents}
import com.opticdev.core.compiler.helpers.{FinderEvaluator, FinderPath}
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.sdk.descriptions.RuleWithFinder
import com.opticdev.sdk.descriptions.enums.{Literal, ObjectLiteral, Token}
import com.opticdev.sdk.skills_sdk.lens._

import scala.collection.immutable
import scala.util.{Failure, Success, Try}

class FinderStage(snippetStageOutput: SnippetStageOutput)(implicit val lens: OMLens, errorAccumulator: ErrorAccumulator = new ErrorAccumulator, variableManager: VariableManager = VariableManager.empty, subcontainersManager: SubContainerManager = SubContainerManager.empty, debug: Boolean = false) extends CompilerStage[FinderStageOutput] {
  override def run: FinderStageOutput = {

    import com.opticdev.sdk.descriptions.helpers.ComponentImplicits._

    implicit val evaluatedFinderPaths = scala.collection.mutable.Map[OMFinder, FinderPath]()

    val components: Vector[OMComponentWithPropertyPath[OMLensComponent]] = lens.valueComponentsCompilerInput.collect{
      case p if p.containsCodeComponent => p
      case p if p.containsAssignmentComponent && p.component.asInstanceOf[OMLensAssignmentComponent].fromToken => p
    }

    val evaluated = components.map(c=> {
      val at = {
        if (c.containsCodeComponent) {
          c.component.asInstanceOf[OMLensCodeComponent].at
        } else {
          c.component.asInstanceOf[OMLensAssignmentComponent].tokenAt.get
        }
      }


      val finderPathTry = pathForFinder(at)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        val errorString = finderPathTry.asInstanceOf[Failure[Exception]].exception.toString
        FinderError(c, errorString)
      } else {
        val finderPath = finderPathTry.get
        (c, finderPathTry.get)
      }
    })



    val finderPaths = evaluated.collect {
      case a: (OMComponentWithPropertyPath[OMLensCodeComponent], FinderPath) => a
    }

    val invalidComponents = evaluated.collect {
      case a: FinderError => a
    }.toVector

    //do not interrupt when in debug mode
    if (invalidComponents.nonEmpty && !debug) {
      throw new InvalidComponents(invalidComponents.collect{case m if m.codeComponent.containsCodeComponent => m.codeComponent.component.asInstanceOf[OMLensCodeComponent]}.toVector)
    }

    val variableRules = variableManager.rules(snippetStageOutput)

    val subContainerRules = subcontainersManager.rules

    val combinedRules = /* lens.rules ++ */ lens.value.values.toVector.flatMap(_.rules) ++ variableRules ++ subContainerRules

    val rulePaths = combinedRules.collect {
      case r: RuleWithFinder =>
      val finderPathTry = pathForFinder(r.finder)
      if (finderPathTry.isFailure) {
        errorAccumulator.add(finderPathTry.asInstanceOf[Failure[Exception]].exception)
        null
      } else (r, finderPathTry.get)
    }.filterNot(_ == null)


    val componentsGrouped = finderPaths.groupBy(_._2).mapValues(_.map(_._1).toVector)
    val rulesGrouped      = rulePaths.groupBy(_._2).mapValues(_.map(_._1))

    FinderStageOutput(componentsGrouped, rulesGrouped, invalidComponents)

  }

  def pathForFinder(finder: OMFinder)(implicit evaluatedFinderPaths: scala.collection.mutable.Map[OMFinder, FinderPath] = scala.collection.mutable.Map[OMFinder, FinderPath]()) : Try[FinderPath] = {
    //no need to evaluate things more than once. Each finder has a distinct finderpath so this lookup is faster.
    if (evaluatedFinderPaths.get(finder).isDefined) return Success(evaluatedFinderPaths(finder))

    val result = Try(FinderEvaluator.finderPath(finder,snippetStageOutput))

    if (result.isSuccess) {
      evaluatedFinderPaths.put(finder, result.get)
    }

    result
  }

}
