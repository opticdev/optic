package com.opticdev.core.sourcegear.graph.edges

import com.opticdev.parsers.graph.CustomEdge
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import play.api.libs.json.JsObject

import scala.util.hashing.MurmurHash3

case class DerivedFrom(transformationRef: TransformationRef, askAnswers: JsObject) extends CustomEdge {
  def hash = Integer.toHexString(MurmurHash3.stringHash(transformationRef.toString + askAnswers.toString()))
}