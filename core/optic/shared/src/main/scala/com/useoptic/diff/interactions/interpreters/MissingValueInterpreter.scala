package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.{Commands, ShapesAggregate, ShapesHelper}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, OneOfKind, OptionalKind}
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.interpretations.BasicInterpretations
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions._
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ObjectFieldTrail, Resolvers, ShapeTrail, UnmatchedShape}
import com.useoptic.logging.Logger
import com.useoptic.types.capture.HttpInteraction

class MissingValueInterpreter(rfcState: RfcState) extends InteractiveDiffInterpreter[InteractionDiffResult] {

  private val basicInterpretations = new BasicInterpretations(rfcState)
  private val descriptionInterpreters = new DiffDescriptionInterpreters(rfcState)

  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiffResult match {
          case sd: UnmatchedShape => {
            interpretUnmatchedShape(d.interactionTrail, d.requestsTrail, sd.jsonTrail, sd.shapeTrail, interaction)
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiffResult match {
          case sd: UnmatchedShape => {
            interpretUnmatchedShape(d.interactionTrail, d.requestsTrail, sd.jsonTrail, sd.shapeTrail, interaction)
          }
          case _ => Seq.empty

        }
      }
      case _ => Seq.empty
    }
  }

  def interpretUnmatchedShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, jsonTrail: JsonTrail, shapeTrail: ShapeTrail, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    val resolved = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)
    if (resolved.isEmpty) {
      Seq(
        WrapWithOptional(interactionTrail, requestsTrail, jsonTrail, shapeTrail, interaction),
        RemoveFromSpec(interactionTrail, requestsTrail, jsonTrail, shapeTrail, interaction)
      )
    } else {
      Seq(
        WrapWithOneOf(interactionTrail, requestsTrail, jsonTrail, shapeTrail, interaction),
        basicInterpretations.ChangeShape(interactionTrail, requestsTrail, shapeTrail, jsonTrail, interaction),
      )
    }
  }

  def RemoveFromSpec(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, jsonTrail: JsonTrail, shapeTrail: ShapeTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val identifier = descriptionInterpreters.jsonTrailDetailedDescription(jsonTrail)
    InteractiveDiffInterpretation(
      s"Remove ${identifier}",
      s"Removed ${identifier}",
      Seq(),
      ChangeType.Removal
    )
  }

  def WrapWithOptional(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, jsonTrail: JsonTrail, shapeTrail: ShapeTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val baseCommands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
    )
    val additionalCommands = shapeTrail.path.lastOption match {
      case Some(pc: ListItemTrail) => {
        Seq.empty
      }
      case Some(pc: ObjectFieldTrail) => {
        val field = rfcState.shapesState.flattenedField(pc.fieldId)
        Seq(
          SetParameterShape(
            ProviderInShape(
              wrapperShapeId,
              field.fieldShapeDescriptor match {
                case fs: FieldShapeFromShape => ShapeProvider(fs.shapeId)
                case fs: FieldShapeFromParameter => ParameterProvider(fs.shapeParameterId)
              },
              OptionalKind.innerParam
            )
          ),
          SetFieldShape(FieldShapeFromShape(field.fieldId, wrapperShapeId)),
        )
      }
      case _ => Seq.empty
    }
    val commands = baseCommands ++ additionalCommands

    val identifier = descriptionInterpreters.jsonTrailDetailedDescription(jsonTrail)

    InteractiveDiffInterpretation(
      s"Make ${identifier} optional",
      s"Made ${identifier} optional",
      commands,
      ChangeType.Update
    )
  }

  def WrapWithOneOf(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, jsonTrail: JsonTrail, shapeTrail: ShapeTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val resolved = Resolvers.tryResolveJsonLike(interactionTrail, jsonTrail, interaction)
    val wrapperShapeId = ShapesHelper.newShapeId()
    val p1 = ShapesHelper.newShapeParameterId()
    val p2 = ShapesHelper.newShapeParameterId()
    val builtShape = new ShapeBuilder(resolved.get)(ShapesAggregate.initialState).run
    val baseCommands = builtShape.commands ++ Seq(
      AddShape(wrapperShapeId, OneOfKind.baseShapeId, ""),
      AddShapeParameter(p1, wrapperShapeId, ""),
      AddShapeParameter(p2, wrapperShapeId, ""),
      SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(builtShape.rootShapeId), p2))
    )
    val additionalCommands = shapeTrail.path.lastOption match {
      case Some(pc: ObjectFieldTrail) => {
        Seq(
          SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(pc.fieldShapeId), p1)),
          SetFieldShape(FieldShapeFromShape(pc.fieldId, wrapperShapeId))
        )
      }
      case Some(pc: ListItemTrail) => {
        Seq(
          SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(pc.itemShapeId), p1)),
          SetParameterShape(ProviderInShape(pc.listShapeId, ShapeProvider(wrapperShapeId), ListKind.innerParam))
        )
      }
      case x => {
        Logger.log(x)
        Seq.empty
      }
    }
    val commands = baseCommands ++ additionalCommands

    val identifier = descriptionInterpreters.jsonTrailDetailedDescription(jsonTrail)

    val t1 = shapeTrail.path.lastOption match {
      case Some(pc: ObjectFieldTrail) => descriptionInterpreters.shapeName(pc.fieldShapeId)
      case Some(pc: ListItemTrail) =>  descriptionInterpreters.shapeName(pc.listShapeId)
      case x => {
        Logger.log(x)
        ""
      }
    }
    val t2 = Resolvers.jsonToCoreKind(resolved.get).name

    InteractiveDiffInterpretation(
      s"Allow ${identifier} to be either a ${t1} or ${t2}",
      s"Allowed ${identifier} to be either a ${t1} or ${t2}",
      commands,
      ChangeType.Addition
    )
  }

  def AddToOneOf(interactionTrail: InteractionTrail): InteractiveDiffInterpretation = {

    //@todo

    InteractiveDiffInterpretation(
      "Add to OneOf",
      "Make it so x can be T1, T2, ..., Tn",
      Seq(),
      ChangeType.Addition
    )
  }
}
