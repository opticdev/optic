package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums
import play.api.libs.json._

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Location(in: LocationTypeEnums)