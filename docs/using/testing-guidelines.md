# Testing Guidelines   
When designing Optic, we wanted to couple the accuracy of the derived API Specs with something developers and their teams have agency over. At the same time, we knew traditional approaches to involving developers such as self-documenting frameworks and annotations were too reliant on developers to change their code and behavior.

With these considerations in mind -- tests emerged as the best candidate to give developers just enough control over their API documentation. Since good API tests already serve as a specification, it seemed natural to couple Optic's accuracy with the tests your team has already written. Optic uses the tests you've already written to deliver an always-up-to-date API Spec. 

**Our promise: If you have good tests for your API, Optic will maintain an accurate API Spec for your team.**

## The Optic Proxy
When you run your tests through Optic, it starts a local proxy server that stands between your tests and your mock API. The proxy logs the request/response of every interaction with your API and uses that real-world data to document the API. Since Optic API Specs are based on real data there's no chance of them being inaccurate or falling behind -- they will document the behavior of your API as it is -- not as you expect it to be. Using Optic has led many teams to discover unexpected behavior (some benign, some risky) allowed by their APIs, but not included in their previous API documentation.  

## Connecting your Tests to the Proxy  
When you run your tests through Optic there will be an environment variable present called 'optic-watching'. Your test fixture should be adapted to forward your requests to the Optic Proxy whenever that environment variable is present. 

The Optic proxy always runs on **localhost:30333** so you'll need to redirect traffic there whenever Optic is watching your project. The proxy will forward your requests back to your mock API based on the entry in your 'optic.yml' file:

```yaml
host: localhost
port: 3001
```

Here's an example of a fixture for Node.js that uses supertest for testing:
```javascript
import supertestRequest from 'supertest'
const opticWatching = process.env['optic-watching']
export const request = (opticWatching) ? 
                       supertestRequest('http://localhost:30333') : 
                       supertestRequest('http://localhost:3001')
```

There are other examples available on our GitHub. If you create a pull request to add an example for a new language / framework, we'll send you a $40 Amazon Gift Card as a thank you from the Optic community.

If you need help getting your tests connected to Optic, reach out to us on Intercom (bottom right of the screen) or email support@useoptic.com 

## What to Test
In addition to giving you confidence in your code, you can think of your tests as providing the dataset Optic uses to write your API Spec. It's likely that your tests already have good coverage of your APIs functionality, but in the event they do not, here are some guidelines that will help you write better tests & get a complete API Spec from Optic:

What to focus on: 
- Test your routers in addition to your controllers. You'll need to make mock HTTP Requests to your API in order for the Optic proxy to log API interactions. 
- Test every API Endpoint you want included in your API Spec
- Test the possible response codes for each endpoint 

What does not matter to Optic: 
Your tests don't need to assert everything you want included in your API Spec. For instance if you assert the status code of a response is 200 and you don't assert anything about the body or response headers of that response -- the entire response will still be documented. It's about the data that get exchanged between the proxy and your API, not the assertions you make. 


**You can write whatever kind of tests you want, in any framework, across any language, the only requirements from Optic is that your tests hit the Optic Proxy.**   