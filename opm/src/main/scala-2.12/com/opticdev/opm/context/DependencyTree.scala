package com.opticdev.opm.context

import com.opticdev.opm.packages.OpticMDPackage
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.hashing.MurmurHash3

case class Leaf(opticPackage: OpticMDPackage, tree: Tree = Tree()) {
  def directDependencies: Set[OpticMDPackage] = tree.leafs.map(_.opticPackage).toSet
  def allDependencies : Set[OpticMDPackage] = tree.flatten
  def hash = tree.hash ^ MurmurHash3.stringHash(opticPackage.description.toString())
}

case class Tree(leafs: Leaf*) {
  def flatten : Set[OpticMDPackage] = leafs.flatMap(l=> l.tree.flatten + l.opticPackage).toSet
  def flattenSchemas : Set[Schema] = flatten.flatMap(_.schemas).toSet
  def flattenTransformations : Set[Transformation] = flatten.flatMap(_.transformations).toSet
  def treeContext: TreeContext = TreeContext(this)

  final def hash: Int = leafs.map(_.hash).fold(0) { (int, lHash) => int ^ lHash }
}
