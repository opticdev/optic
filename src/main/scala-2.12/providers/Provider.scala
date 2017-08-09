package providers

case class Provider(modelProvider: ModelProvider,
                    insightProvider: InsightProvider,
                    accumulatorProvider: AccumulatorProvider,
                    astExtensionProvider: AstExtensionProvider) {
  def clearAll = {
    insightProvider.clear
    modelProvider.clear
    accumulatorProvider.clear
    astExtensionProvider.clear
  }
}