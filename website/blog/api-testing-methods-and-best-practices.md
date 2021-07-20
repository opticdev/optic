---
date: 2021-06-02
title: "API Testing: Methods and Best Practices"
author: John Gramila
author_image_url: "/img/people/john-gramila.jpeg"
category: Community
social_image: social-api-testing-methods-and-best-practices.png
---

![A laboratory worker is running API tests with test tubes](/img/blog-content/social-api-testing-methods-and-best-practices.png)

Application Programming Interface (API) testing is more complicated than testing a single-host application. Single-host applications can often be covered by unit and integration tests, but an API functions only if there is a both requester and a respondent. To fully test your API, you have to think about testing the application from both of these perspectives.

Testing the API from the perspective of the requester means testing authentication, data accuracy, data formatting, overall consistency, and relevance of available documentation. The respondent needs unit tests for the components it uses and the data transformations it makes. It also needs to ensure it can both handle properly formulated requests and reject requests that are malformed or maliciously formed. You also need to test the connection to the data layer to ensure that whatever source the API draws from is accessible and understandable. This article will go into more detail about the tools and best methods for effectively testing your API.

<!--truncate-->

## Application Testing

To test the application handling API requests—and performing some functionality to update or return data with those requests—you’ll want to isolate and test functionality. The application absolutely benefits most from traditional unit testing and error monitoring. If the API allows requests that create new users, for example, you'll want to have a unit test encompassing the functions that perform that action and the responses those functions generate. Often functionality that is exposed in an API can also be performed from a graphical user interface (GUI), so make sure you're able to find and unit test the function that both those interfaces use.

You won't implement load testing at the application level. It's more like a bundle of end-to-end tests, but you'll want to start thinking about it. Planning for your usage with APIs is important, because as your product gains popularity, the load on your API will rise—sometimes unexpectedly. A solid understanding of what might limit your API (network capacity, memory, or compute) starts at the application level, and that knowledge will help you respond quickly when you need to increase capacity.

If the application is interacting with a data layer, you'll also want to test that connection. Database connections are another possible bottleneck for your API handling a high volume of requests. Also, if the API utilizes a caching layer, try to incorporate that component into your test strategy.

## Application Programming Interface Testing

API testing is most similar to specialized end-to-end testing. You have to test making the request through receiving a properly formed and legible response from your application.

### Functionality

The most important tests for your API are ones that determine if it's functioning properly. One of the fundamental pieces of testing your API is the HTTP status responses. The API should test returning a good range of the expected HTTP codes, including the full range of 2xx responses for any successful API request, 401s when users are unauthenticated, and a 400 upon receiving a malformed request.

In addition to testing a good chunk of HTTP responses you expect out of your API, you also have to test the quality of the data that your API returns. To keep your API running smoothly, it’s vital to test that data is delivered accurately and is formatted properly. Verify the format and contents of the data you receive at the completion of your end to end tests.

While you're testing this functionality, pay a little attention to how easy it is to formulate requests. This is a great time to check in on the quality of life for your users. Make sure your requests are simple to formulate, and your public documentation is accurate and easy to follow.

### Load Testing

Part of the functionality of your API should test is its ability to handle elevated request loads. As your API grows, it will face more requests. As clients grow more familiar with your application and start to rely on it more heavily, your load will increase. Having benchmarks figured out in advance allows you to respond  from a position of knowledge to both steadily increasing interest and to unpredictable spikes. During all of this application testing, remember to keep an eye on your logs, and note and remediate any errors you find.

### Security

APIs are public facing and open to the internet, so it's also vital to test their security. There are many facets of security testing. If your API requires authentication, that's the best place to start. Ensure that unauthenticated individuals aren't able to access data, and authenticated individuals are. If you have tiers of authentication, check that each step up the authentication chain has access to the proper data, and isn't able to reach into other authentication levels.

One of the test treatments APIs get that straddles the boundary of functionality testing and security testing is throwing a few weird requests at your API. As a public-facing entity, your API will receive all kinds of odd requests. Some of them will be plain wrong, and some of them will be malicious. Testing the edges of acceptable responses by throwing a wild brew of requests is known as [fuzz testing](https://owasp.org/www-community/Fuzzing). You're fuzzing the edges of expected request formats. Testing the API responds properly to requests with unusual headers and body contents will help make your API more stable, and enhance the security of your application.

## Automating Tests

Because an API requires a requester and a respondent, we often want to use a library or tool that will mock the requester. It's also a good idea to hook tests into your deployment and development process so they are run regularly, building confidence in the stability of your API.

## Tools for Testing

The easiest way to get started with API testing is in your browser’s inspector. For instance, Firefox offers the ability to edit and resend HTTP requests, which is perfect during test development or even performing basic tests.

The easiest-to-use tool for most API testing is probably [Postman](https://www.postman.com/automated-testing/), which started as a Chrome extension. It handles mocking the requester and through a simple interface. It also allows you to integrate with a CI/CD tool such as Jenkins, so you can run tests automatically when you commit or deploy your changes. That's also true of the popular [SoapUI](https://www.soapui.org/) family of testing tools.

There are lots of framework options for running your API tests. It's likely you'll want to choose one that is built to fit your existing framework, language, and deployment toolset.

## Documentation Testing

APIs are designed for people who don't have direct access to a data collection. Unlike many internal applications, APIs are designed for people in other organizations, departments, and technical expertise levels. This means that the documentation of any API is a core part of its functionality. Users have to implement and maintain infrastructure to consume your API. One of your goals as an API developer is ensuring the reliability of that external infrastructure.

Secretly, this is one of the greatest benefits of testing your API. That process helps you fully understand and document its functionality even before it is exposed to the world. If people aren't able to effectively use your API, the usefulness of that API is critically compromised.

One of the real challenges of API development is maintaining a usable public-facing portal and accurate documentation while also implementing changes and improving the technical foundation of your application. Striking the balance between improvement and reliability is tricky, and testing and documentation make those processes dramatically simpler.

## Optic

[Optic](https://www.useoptic.com/)’s goal is to simplify and automate the process of writing about and monitoring the stability of your API endpoints. By integrating with your [tracked changes](https://www.useoptic.com/docs/using/reviewing-diffs/), Optic carries your ability to document and track changes to your API endpoints a step further. It also integrates directly into your build process and maps and monitors your API's [endpoints](https://www.useoptic.com/docs/using/baseline), allowing you access reports about changes, endpoint monitoring, and specification monitoring.

Optic also helps you establish confidence in your API test coverage with its automatic code coverage feature. Using Optic, you can easily understand exactly what parts of your API are tested, and what parts change whenever you commit a modification. Optic can generate documentation for your API as problems are encountered, and you can import your test coverage to build automatic reports and maps of your application.

## Conclusion

API testing is more complicated than testing most single-host applications because there’s a user on the other end of it slowly learning how to use your application. The only guidelines they have are your documentation, and the security control is what you put in place for your API. Testing and documenting are important for ensuring that rollout and maintenance proceed without a hitch.
