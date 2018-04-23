package com.opticdev.common
case class PackageVersion(version: String,
                          hash: String,
                          url: String,
                          opticMdVersion: String,
                          published: Boolean = true,
                          //                          dependencies: Seq[DependencyReference] //@todo bring in at some point
                         ) extends Versioned

case class PackageResult(`for`: PackageRef, satisfiedWith: PackageVersion)