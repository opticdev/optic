package com.opticdev.opm.context

import com.opticdev.opm.packages.OpticPackage
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.skills_sdk.schema.OMSchema

import scala.util.hashing.MurmurHash3

case class Leaf(opticPackage: OpticPackage, tree: Tree = Tree()) {
  def directDependencies: Set[OpticPackage] = tree.leafs.map(_.opticPackage).toSet
  def allDependencies : Set[OpticPackage] = tree.flatten
  def hash = tree.hash ^ opticPackage.hash
}

case class Tree(leafs: Leaf*) {
  def flatten : Set[OpticPackage] = leafs.flatMap(l=> l.tree.flatten + l.opticPackage).toSet
  def flattenSchemas : Set[OMSchema] = flatten.flatMap(_.schemas).toSet
  def flattenTransformations : Set[Transformation] = flatten.flatMap(_.transformations).toSet
  def treeContext: TreeContext = TreeContext(this)

  final def hash: Int = leafs.map(_.hash).fold(0) { (int, lHash) => int ^ lHash }
}
