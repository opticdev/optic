package com.useoptic.diff



abstract class RequestLike {
  def url: String
  def method: String
  def queryString: String
  def contentType: String
  def bodyShape: ShapeLike
}

abstract class ResponseLike {
  def statusCode: Int
  def contentType: String
  def bodyShape: ShapeLike
}

abstract class ApiInteractionLike {
  def request: RequestLike
  def response: ResponseLike

  def asApiInteraction: ApiInteraction
}

object ApiInteractionLike {

  def fromApiInteraction(apiInteraction: ApiInteraction): ApiInteractionLike = new ApiInteractionLike {
    override def request: RequestLike = new RequestLike {
      override def url: String = apiInteraction.apiRequest.url
      override def method: String = apiInteraction.apiRequest.method
      override def queryString: String = apiInteraction.apiRequest.queryString
      override def contentType: String = apiInteraction.apiRequest.contentType
      override def bodyShape: ShapeLike = ShapeLike.fromActualJson(apiInteraction.apiRequest.body)
    }
    override def response: ResponseLike = new ResponseLike {
      def statusCode: Int = apiInteraction.apiResponse.statusCode
      def contentType: String = apiInteraction.apiResponse.contentType
      def bodyShape: ShapeLike = ShapeLike.fromActualJson(apiInteraction.apiResponse.body)
    }

    override def asApiInteraction: ApiInteraction = apiInteraction
  }


}
