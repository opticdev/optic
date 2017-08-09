package providers

import cognitro.core.components.models.ModelDefinition
import cognitro.parsers.AstExtension.{AstExtensionBase, AstExtensionSet}
import cognitro.parsers.GraphUtils.NodeType

trait AstExtensionProvider {

  def extensionSet : AstExtensionSet

  def clear : Unit

  def addAstExtension(extension: AstExtensionBase)

  def addAstExtensions(extensions: AstExtensionBase*)

  def removeAstExtension(extension: AstExtensionBase)

  def extensionForNodeType(nodeType: NodeType): Option[AstExtensionBase]

}
