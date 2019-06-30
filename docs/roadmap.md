# Roadmap

Our long term goal is to make the experience of designing, building and consuming APIs seamless. Documenting and consuming an API can and should be as easy as running `npm publish` or `npm install`. 

We're not there yet, and we know we will not get there overnight. It's also clear that our goal won't be reached by quickly releasing half-baked solutions. Doing this right will take time, commitment, and a deliberate focus on providing the best experience out there.     

#### Design Values
- **Think from first principles**    
- **Focus on finding the right problems to solve** -- Problems are usually solved during the process of defining them. 
- **Quality of feature > depth of features** -- It's called Seamless. It better work. 
- **Everyone comes along** -- Technologists often build tools that only assist developers on greenfield projects while only a fraction of the world's developer man-hours are spent on greenfield work. We care about improving the lives of developers, so our solutions work with both greenfield and brownfield applications.
- **Put the difficult technology in the core project** -- When your team and your tools are based on Seamless, you get to focus on solving your problems while we solve ours. 


## What's Next?

Seamless just launched [a new kind of API spec](./seamless-spec.md) and the [Seamless Designer](https://editor.seamlessapis.com). There's a lot of work to be done across the plane of API workflows (see "Longer Term Projects"), but we're starting at the beginning: API design, quality, and governance.

### On Design
We think API design today can be greatly improved in these key areas:
#### Collaboration  
Today's API design tools are not built around the workflow of the team. How can we make it easier to gather requirements, ask for changes, notify consumers of new capabilities, and warn about breaking changes when this is the case? An API designer should be built around the way a team works, and not just the protocol it's trying to support. Seamless is bringing collaboration to the forefront of the design process, and we've structured our entire system around making it easy to iterate  solutions to the challenges above.  

#### Better Abstractions
How can we make it easier to build off of conventions like OData, Hypermedia, JSON API, and the standards a team has converged on internally? Achieving optimal resourcing and sharing of common API structures requires new abstractions that help us build, use, and share the generic parts of our API. We're releasing generic concepts (like `InfiniteScroll[Users]`) and generic requests (like `GetListOf[Orders]`). Generics will help API designers build more uniform APIs in a fraction of the time it takes to spec out an API today manually. 

#### Better Developer Experience
More developers are embracing visual API design tooling. Some of the tooling is good, some is not. We're committed to providing an open source option that's both a powerful and enjoyable developer experience. 

### On Quality and Governance
It's important for a team's APIs to follow conventions. When a single API is not internally consistent, it's very difficult for consumers to learn it. The same holds true between APIs. If you have 20 APIs, they should all behave similarly internally.   

We can argue all day about which conventions make the most sense, but it's hard to argue against API conventions. Unfortunately, it's also hard to enforce them today. Good luck writing anything beyond the most basic linters for an OpenAPI file.

Making API specs lintable and presenting warnings as the API is being designed (rather than in a test suite) makes it much easier for teams to converge on the same standards. 

But linting is never enough, we have to make doing things the *right way* easier than doing things the *wrong way*. That's why we're building generics first. If your project is full of generics that define your standard API components, a linter can check if the standards are being used. For instance, you can write a rule that enforces the use of your pagination standard with a predicate that checks if all 200s that return an array of records, use `Pagination[T]`. 

If mis-usages are found, it is be possible to offer users the ability to change the offending concept or request one of the generic types that describe your team's standards.  


## Longer term projects
We've been experimenting the last few months and a have found a lot of interesting areas to build tooling. While we do not have a solid idea for when tooling in these areas will become part of the Seamless ecosystem, we do feel like it's worth sharing the problems we've uncovered and our general ideas about how to approach them. 

### Testing
Whether you go design-first or code-first, it's hard to know with a degree of certainty that your API actually aligns with the contract. Even on established teams who are using OpenAPI everyday, there are few engineers who actually trust the spec. If there's one reason why SDK generation hasn't taken off for REST the same way it has in RPC land, it's that there's low confidence in the spec. 

Clearly, we need to rethink the testing and the workflows we use while editing the spec.

At Seamless, we think of testing as a diffing and coverage problem. If the API's behavior during testing diverges from the spec, we need to record that discrepancy. If the testing doesn't cover the entire spec, we have to record which parts we have low confidence in. To get the best coverage of the API, we need to do 'sensory integration' to combine the samples from automated code tests, postman, manual testing, etc. into one cohesive report. 

Once we've tested the surface area of our API, we can show you the diff between your Spec and your actual API. 
- If your diff is empty, the API and Spec are in sync. 
- If the diff has contents, you either need to a) update your spec or b) fix your code.
- If there's a diff detected while deploying to production, the build should fail. 
 
What's missing in today's world is a workflow that makes it easy to find problems and provides the safety to update the spec based on your code's real-world behavior. Seamless seeks to fill this space and create a better experience for your team.    

### Code Generation
Code generation can make it easy to build APIs and client SDKs, but we know you will only use it if the code works and it follows your team's conventions. The core contributors of Seamless have a lot of experience building code generators and tools to safely modify generated code. 

We'll begin development on this front as soon as we are confident that you have the tools you need to ensure the accuracy of your specs.  

### Distributing API Artifacts
There's no pipeline for building and retrieving these assets on teams that generate SDKs and protobuff code. Often, one member of the team knows how to generate the artifacts and uploads them to a shared Dropbox account or GitHub. Once an API spec is updated, new SDKs can be generated and added to a development channel. Once the API is deployed, those artifacts can be promoted to a production chanel.   
 
Once we can be confident that our SDKs are being generated and deployed when our spec changes, consuming APIs will start to feel like using a package manager. We should be able to run `api consume my-backend` and get the latest verizon of that SDK added to our project. There's a ton of opportunity here for us to build here.


