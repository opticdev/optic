package com.opticdev.core.sourcegear.graph.edges

import com.opticdev.parsers.graph.CustomEdge
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import play.api.libs.json.JsObject

case class DerivedFrom(transformationRef: TransformationRef, askAnswers: JsObject) extends CustomEdge