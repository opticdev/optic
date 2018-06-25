package com.opticdev.core.sourcegear.project.config

import net.jcazevedo.moultingyaml.{YamlArray, YamlObject, YamlString, YamlValue}

import scala.util.Try

trait PFInterface {
  def yamlValue : YamlValue
}

case class PFRootInterface(
                            name: PFFieldInterface[YamlString],
                            parsers: PFListInterface[YamlString],
                            skills: PFListInterface[YamlString],
                            knowledgePaths: PFListInterface[YamlString],
                            exclude: PFListInterface[YamlString]
                          )

case class PFListInterface[T <: YamlValue](initialValue: List[T]) extends PFInterface {
  val value = collection.mutable.ListBuffer[T](initialValue:_*)
  def yamlValue = YamlArray(value.toVector)
}

object PFListInterface {
  def forKey[T <: YamlValue](key: String, defaultValue: YamlArray, yaml: YamlObject) =
    PFListInterface[T](
      Try(yaml.fields.getOrElse(YamlString(key), YamlArray(Vector()))
        .asInstanceOf[YamlArray]
        .elements.filter(_.isInstanceOf[T])
        .toList).getOrElse(List()).asInstanceOf[List[T]]
    )
}


//For flat fields
case class PFFieldInterface[T <: YamlValue](initialValue: T) extends PFInterface {
  private var valueStore : T = initialValue
  def set(newValue: T) = valueStore = newValue
  def yamlValue : T = valueStore
}

object PFFieldInterface {
  def forKey[T <: YamlValue](key: String, defaultValue: T, yaml: YamlObject) =
    PFFieldInterface[T](Try(yaml.fields.get(YamlString(key)).get.asInstanceOf[T]).getOrElse(defaultValue))
}
