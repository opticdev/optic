---
date: "10/6/2020"
title: "Documenting Spring Boot Microservices with Optic"
author: Lou Manglass
author_image_url: "/img/team/lou.jpg"
category: Built with Optic
---

Optic helps teams write and maintain their first OpenAPI specifications. You don't need to get your team on-board to learn OpenAPI or worry about maintaining 10k line YAML files -- Optic takes care of all of that. Optic manages this process whether your development environment is running locally on your machine out in the Cloud, or somewhere in between. No matter where you develop and test, you have confidence that every change to your API is reviewed, approved, and documented before it's released. Optic can work at any interface in your project, even with microservices.

<!--truncate-->

## Document your Spring Boot Microservices oriented API

[Spring Boot](https://spring.io/microservices) makes it easy to spin up small Java services and integrate with service discovery tools such as [Eureka](https://github.com/Netflix/eureka). There are lots of ways to develop, test, and run a microservices oriented architecture, and we're not going to go into them here. In this post, we're going to focus on documenting an individual service within an existing application. The goal will be to document a core service so that we can assure it operates properly and potentially reuse it for other applications. Sharing a microservice is a good reuse of existing code. The further it is shared, though, the greater the "blast radius" (or impact of errors) should it stop behaving as intended. Optic will help us understand the contract of the service we're reusing, share that with other teams, and assure the application behaves as intended.

## An Overview

For demonstration purposes, I want to jump right into an existing API. I picked a [Foreign Exchange market oriented microservices API](https://www.springboottutorial.com/creating-microservices-with-spring-boot-part-1-getting-started) by [springboottutorial.com](https://www.springboottutorial.com/) because it was was an existing minimal API in Spring Boot, had two layers (customer interface and internal interface), and used Eureka for service discovery. You can follow along by running through the tutorial yourself or [cloning the repository](https://github.com/in28minutes/spring-boot-examples/tree/master/spring-boot-basic-microservice) which is pretty much ready to go after setting up pre-requisites.

The application we're looking at is composed of two services:

- `CURRENCY-CONVERSION-SERVICE` is a consumer-facing microservice that interprets and routes requests to internal services to perform appropriate conversions.
- `FOREX-SERVICE` is an internal service that determines Foreign Exchange market rates, and returns the results for presentation to consumers. Consumers never talk directly to this service, though other applications we write may re-use this service.

![Service flow chart](/img/blog-content/springboot-service-chart.png)

Not pictured is the Eureka service. Eureka handles service discovery. When an instance of a microservice comes online, it registers with Eureka to say it is available for traffic. It also learns how to find other services, based on instance registration. For example, both our `CURRENCY-CONVERSION-SERVICE` and `FOREX-SERVICE` will register their URLs with Eureka at start-up, and `CURRENCY-CONVERSION-SERVICE` will use Eureka to discover where to send traffic for `FOREX-SERVICE` requests. This is how we can scale our application: if more instances are needed of either (or both) services, they can spin up and register with Eureka. When scaling down, instances tell Eureka that they are shutting down and Eureka removes their URL registrations. 

The key point here is that Eureka tells services how to find each other, so the services can speak directly to each other. We need to register with Eureka to observe traffic, even though we won't be receiving traffic from Eureka.

## The Existing API

Our current application is run by invoking `Maven` on three Spring Boot projects: two for the services, and one for Eureka. They all start similarly:

``` bash
mvn spring-boot:run
```

Then, we can make a quick call to get a conversion. In this case, we'll see what 10000 Euros will yield in Indian Rupees (this is an example only, and doesn't reflect actual conversion rates): 

``` bash
curl http://localhost:8100/currency-converter/from/EUR/to/INR/quantity/10000
```

``` json
{"id":10002,"from":"EUR","to":"INR","conversionMultiple":75.00,"quantity":10000,"totalCalculatedAmount":750000.00,"port":8000}
```

At this point, we haven't observed any traffic with Optic. Traditionally, we'd recommend [setting up Optic](/docs/) with our Recommended Mode. This allows you to start up your API and observe it with Optic all in one command. It's very convenient, and would work well if we put it in front of the consumer service. In this example, we want to monitor the internal service (`FOREX-SERVICE`) directly. That looks a bit different:

``` bash
curl http://localhost:8000/currency-exchange/from/EUR/to/INR
```

``` json
{"id":10002,"from":"EUR","to":"INR","conversionMultiple":75.00,"port":8000}
```

This is the service we are planning to reuse in another application, and so is the service we want to document directly with Optic. Note it does not give the same response as the consumer-facing service. Starting Optic in front of the consumer service (`CURRENCY-CONVERSION-SERVICE`) won't help us in this case.

## Injecting Optic into our service discovery

Ideally, we'll want to inject Optic between our internal service and the service discovery tool. We could set up a full Spring Boot Sidecar definition for Optic, which would let us register Optic as its own service. That's fine if we want to redirect the consumer service. In this case, I'd prefer to be a bit sneakier as I don't want to change the services around. Instead, I'll manually register Optic as the `FOREX-SERVICE`, and define Optic manually to act as a proxy.

I'll set up my `optic.yml` like below, with an `inboundUrl` for receiving traffic and an `outboundUrl` to forward the traffic on to our internal service. I'll define it as the port the service is already using, so no new configuration is necessary. You can read more about configuration options in our <Link to="/docs/faqs-and-troubleshooting/captures">documentation</Link> if you'd like:

``` yml
name: "Optic Proxy"
tasks:
  start:
    targetUrl: "http://localhost:8000"
    inboundUrl: "http://localhost:9000"
```

I'll also write a small script to start Optic, start our existing service, and then register Optic as the `FOREX-SERVICE`. Currently, we can start the Eureka service and the consumer facing `CURRENCY-CONVERSION-SERVICE` as those invocations are unchanged. This will give us a running Eureka instance reporting the `CURRENCY-CONVERSION-SERVICE` is up and ready to receive traffic. It won't be able to process any transactions yet, because the `FOREX-SERVICE` is not present:

![Eureka registrations](/img/blog-content/springboot-registrations-start.png)

Without the `FOREX-SERVICE`, requests to the consumer-facing `CURRENCY-CONVERSION-SERVICE` will fail:

```
$ curl http://localhost:8100/currency-converter/from/EUR/to/INR/quantity/10000

{
...
"message":"I/O error on GET request for \"http://localhost:8000/currency-exchange/from/EUR/to/INR\": Connection refused; nested exception is java.net.ConnectException: Connection refused","path":"/currency-converter/from/EUR/to/INR/quantity/10000"}
```

Let's get our injected service started. The `optic-forex.sh` script I wrote looks like this:

``` bash
#!/bin/sh

api run start &

mvn spring-boot:run &

curl --verbose -XPOST -H "Content-Type: application/json" --data-binary @body-register.json http://localhost:8761/eureka/apps/forex-service
```

Again, we could (and should) do this in different ways. This was the quickest path to mock up a direct injection over the existing service, for demonstration purposes. Once that's running, we'll see our new service is registered:

![Eureka registrations, now with Optic](/img/blog-content/springboot-registrations-start-2.png)

Note there are two instances: one on port 8000 and one on port 9000. The existing service registered itself (remember, we made zero changes to the service and its definitions, so it's behaving as it always does). This serves as a bonus demonstration: we don't need to capture _all_ of the traffic to a service. We can run Optic on a subset of instances. Provided there's a lot of traffic (such as in load testing, or testing scaling features) Optic can capture a fraction of it and still document your entire API. Sure enough, if we run our request against the currency converter four times, we'll see two observations in Optic

``` bash
curl http://localhost:8100/currency-converter/from/EUR/to/INR/quantity/10000
```

![](/img/blog-content/springboot-optic-observation.png)

Let's start the documentation process to confirm that we're indeed seeing the `FOREX-SERVICE` payload and not the consumer payload. Remember, the internal service does not include the quantity to convert nor does it contain the final calculated amount:

![](/img/blog-content/springboot-optic-payload.png)

Success! We now have a documented internal service. We can monitor it for changes, and as we share this service across the organization the documentation will live alongside it. Other teams can use this service confident in its intended behavior and any changes.

## Getting Started

This was a very simplified example of how Optic could work on internal services in a microservices oriented architecture. We took a few shortcuts to keep things as simple as possible. This definitely isn't a prescriptive solution, and the best fit will determine what you are documenting, how it's architected, and who the consumers of the documentation will be. You can always set up time to [chat with the Optic team](https://calendly.com/optic-onboarding/setup-help) to go over your use case. If you have a specific use case with an example project you'd like to see highlighted, let me know at `lou@useoptic.com`. I'd be happy to get more specific, and if you don't mind, share the results in a future blog post.

Please feel free to [get started](/docs/) on your own as well, and reach out to us if you have any issues.

## Resources

- [Spring Boot tutorial](https://www.springboottutorial.com/creating-microservices-with-spring-boot-part-1-getting-started)
- [Spring Boot tutorial code](https://github.com/in28minutes/spring-boot-examples/tree/master/spring-boot-basic-microservice)
- [Spring Boot project](https://spring.io/projects/spring-boot)