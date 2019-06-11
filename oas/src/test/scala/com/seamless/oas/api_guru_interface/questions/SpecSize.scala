package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.OASResolver
import com.seamless.oas.api_guru_interface.{All, AskFilter, AskTrait, OAS3}
import play.api.libs.json.{JsArray, Json}


case class Size(api: String, asMB: Float)

object SpecSize extends AskTrait[Size, Unit] {
  override def question: String = "What's the mean / std deviation of spec sizes?"

  override def filter: AskFilter = All

  override def processAPI(resolver: OASResolver, apiName: String): Size = {
    val asMB = Json.prettyPrint(resolver.root).getBytes.length.toFloat / 1000000f
    Size(apiName, asMB)
  }

  override def report(results: Size*): Unit = {
   val sizes = results.map(_.asMB)

    val average = sizes.sum / sizes.length

    println(s"Average size ${average}mb" )

    def StandardDeviation[A](a: Seq[A])(implicit num: Numeric[A]):Double = {

      def mean(a: Seq[A]): Double = num.toDouble(a.sum) / a.size

      def variance(a: Seq[A]): Double = {
        val avg = mean(a)
        a.map(num.toDouble).map(x => math.pow((x - avg), 2)).sum / a.size
      }

      math.sqrt(variance(a))
    }

    val sbtDeviation = StandardDeviation(results.map(_.asMB))
    print(s"Standard deviation ${sbtDeviation}mb")


    println(s"Max size ${results.map(_.asMB).max}mb" )
    println(s"Min size ${results.map(_.asMB).min}mb" )
  }
}
