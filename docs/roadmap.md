# Roadmap

Our long term goal is to make the experience of designing, building and consuming APIs seamless. Documenting and consuming an API can, and really should be as easy as running `npm publish` or `npm install`. 

We are not there yet, and we know we will not get there overnight. It is also clear the goal will not be reached by quickly releasing a bunch of half-baked solutions. Doing this right will take time, commitment and a deliberate focus on providing the best experience out there.     

#### Design Values
- **Think from first principles**    
- **Focus on finding the right problems to solve** -- problems are usually solved during the process of defining them 
- **Quality of feature > depth of features** -- It is called Seamless, it better work 
- **Everyone comes along** -- too often technologists build tools that will only assist developers on greenfield projects, but only a fraction of the world's developer manhours are spent on greenfield work. If you really care about improving the lives of developers your solutions must work with greenfield and brownfield applications.
- **Put the difficult technology in the core project** users and tools based on Seamless should get to focus on solving their problems instead of solving ours. 


## What's Next?

Seamless just launched by shipping [a new kind of API spec](./seamless-spec.md) and the [Seamless Designer](https://editor.seamlessapis.com). There is a lot of work to be done across the plane of API workflows (see section on Longer term projects), but we are starting at the beginning: API design and quality/governance.

### On Design
We think API design today can be greatly improved in several key areas:
#### Collaboration  
Today's API design tools are not built around the workflow of the team. How can we make it easier to gather requirements, ask for changes, notify consumers of new capabilities, and warn about breaking changes...? An API designer should be built around the way a team works, and not only protocol it is trying to support. Seamless is making collaboration a first-class-citizen and we have structured our entire system around making it easy to iterate on solutions to the challenges laid out above.  

#### Better Abstractions
How can we make it easier to build off of conventions like OData, Hypermedia, JSON API, and the standards a team has converged on internally? Achieving optimal resource and sharing of common API structures requires new abstractions that help us build, use and share the generic parts of our API. We are about to release generic concepts (like `InfiniteScroll[Users]`) and generic requests (like `GetListOf[Orders]`). Generics will help API designers build more uniform APIs, in a fraction of the time it takes to spec out an API today manually. 

#### Better Developer Experience
More and more developers are embracing visual API design tooling -- some of the tooling is good, some is not. We are committed to providing a open source option that is powerful and has an awesome developer experience. 

### On Quality/Governance
It is important for a team's APIs to follow conventions. When a single API is not internally consistent it is very difficult for consumers to learn it. The same holds true between APIs -- if you have 20 APIs, internally they should all behave similarly.   

We can argue all day about which conventions make the most sense, but it is hard to argue against API conventions. Unfortunately it is also really hard to enforce them today -- good luck writing anything but the most basic linters for an OpenAPI file...

Making API specs lintable and presenting warnings that present themselves as the API is being designed (not in some test suite) will make it much easier for teams to converge on the same standards. 

But linting is never enough, you have to make doing things the *right way* easier than doing things the *wrong way*. That is why we are building generics first. If your project is full of generics that define your standard API components, a linter can just check if the standards are being used. For instance, we can write a rule that enforces the use of our pagination standard with a predicate that checks if all 200s that return an array of records, use `Pagination[T]`. 

If mis-usages are found, it should be possible to offer users the ability to change the offending concept or request into one of the generic types that describe their team's standards.  


## Longer term projects
We have been experimenting the last few months and a have found a lot of interesting areas to build tooling around. While we do not have a solid idea for when tooling in these areas will become part of the Seamless ecosystem, we do feel like it is worth sharing the problems we have uncovered and our general ideas about how we would approach them. 

### Testing
Whether you go design-first or code-first, it is hard to know for sure that your API actually aligns with the contract. Even on established teams we have spoken with that use OpenAPI everyday, there are few engineers who actually trust the spec. If there is one reason why SDK generation has not taken off for REST the same way it has in RPC land, it is because the there is often low confidence in the spec. 

Clearly testing, and the workflows we use while editing the spec needs to be rethought. 

At Seamless, we think of testing as a diffing and coverage problem. If the API's behavior during testing diverges from the spec, we need to record that discrepancy. And if the testing does not cover the entire spec we have to record which parts we have low confidence in. To get the best coverage of the API we need to do 'sensory integration' and combine the samples from automated code tests, postman, manual testing, etc into one cohesive report. 

Once we have tested the surface area of our API, we can show users the diff between their Spec and their actual API. 
- If your diff is empty the API and Spec are in sync. 
- If the diff has contents, you either need to a) update your spec or b) fix your code.
- If there is a diff detected while deploying to production, the build should probably be failed. 
 
A workflow that makes it easy to find problems, and provides the safety to update the spec based on your code's real-world behavior is really important and something that is missing today.    

### Code Generation
Code generation can make it really easy to build APIs and client SDKs, but developers will only use it if the code works and it follows their team's conventions. The core contributors of Seamless have a lot of experience building code generators and tools that let you safely modify generated code. We have a lot of ideas for how to improve this part of the process once we are confident. 

We will get on this once we are confident Seamless users have the tools they need to ensure the accuracy of their specs.  

### Distributing API Artifacts
On team's we have talked to that generate SDKs and protobuff code, there is often no pipeline for building and retrieving these assets. It is often the case that one member of the team knows how to generate the artifacts and then they upload them to a shared Dropbox account or GitHub. Once an API spec is updated, new SDKs should be generated and added to a development channel. Once the API is deployed, those artifacts should be promoted to a production chanel.   
 
Once a team can be confident that their SDKs are being generated and deployed when their spec changes, consuming APIs will start to feel like using a package manager. We should be able to run `api consume my-backend` and get the latest verizon of that SDK added to our project. There is a ton of opportunity here and if someone else does not build this before we get here, we will. 


