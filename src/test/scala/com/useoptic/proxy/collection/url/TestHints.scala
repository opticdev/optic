package com.useoptic.proxy.collection.url

object TestHints {
  def userById = URLHint("/users/:userId", "^\\/users\\/([^\\/]+?)(?:\\/)?$", Vector("userId"))
  def userProfileById = URLHint("/users/:userId/profile", "^\\/users\\/([^\\/]+?)\\/profile(?:\\/)?$", Vector("userId"))
  def likersByTweetId = URLHint("/posts/:tweetId/likers", "^\\/posts\\/([^\\/]+?)\\/likers(?:\\/)?$", Vector("tweetId"))
  def interActionsByUser = URLHint("/interactions/:personA-:personB", "^\\/interactions\\/([^\\/]+?)-([^-\\/]+?)(?:\\/)?$", Vector("personA", "personB"))
}
