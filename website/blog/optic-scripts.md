---
date: "9/9/2020"
title: "React to API Changes with Optic Scripts"
author: Lou Manglass
author_image_url: "/img/team/lou.jpg"
category: Release
---

Optic helps teams write and maintain their first OpenAPI specifications. You don't need to get your team on-board to learn OpenAPI or worry about maintaining 10k line YAML files -- Optic takes care of all of that. This is great, because you have your OpenAPI specification, you can tap into the thousands of community-built tools that make building, publishing and testing your APIs easier.

## Optic Scripts

We're proud to announce a new capability in Optic, [Scripts](/docs/apiops/scripts), which makes it easy to use the OpenAPI spec Optic gives you with a variety of other tools. Scripts help you share the information Optic knows about your APIs with other systems. Script definitions live inside your `optic.yml` file and are invoked with the `api scripts` command. The Optic Scripts feature is included when you [add Optic to your API](/docs/).

<!--truncate-->

#### Examples:

## Generating documentation with `shins`

Let's say I've been documenting an API. Here's an example of what the current documentation looks like inside of Optic:

![An example of some documentation](/img/blog-content/scripts-example-documentation.png)

This is a great start, and I'm ready to share it with the rest of the world. The problem is, we have many users both across our teams internally and outside our organization. I can't assume every use case supports viewing the documentation in Optic. Optic will remain my source of truth, and I'll syndicate that out through other tools. For example, I may want to publish the documentation with a static generator like [shins](https://www.npmjs.com/package/shins) as well as providing it alongside the project with Optic.

Now I just need to get the Optic spec into `shins`. There's more bad news: I don't have anything installed that can help. It's likely that my teammates don't, either:

```
npm list --global --depth=0
```

```
/usr/local/lib
├── @useoptic/agent-cli@8.3.0
├── @useoptic/ci-cli@8.3.0
├── @useoptic/cli@8.3.0
├── newman@5.1.2
└── npm@6.14.7

```

Starting with Optic 8.3, this process can be resolved quickly and easily for the whole team with Scripts. I can add a script definition to the project's `optic.yml` file. Using the `dependsOn` parameter, I'll have the script check for `shins` first. I also need to migrate the OpenAPI specification through Markdown first with `widdershins`, so I'll include that as a dependency as well. Optic will use the `install` parameter to assure these dependencies are present. Finally, we can define the `command` to generate our static API documentation:

```
# optic.yml
scripts:
  publish-spec:
    command: "widdershins $OPENAPI_JSON -o /tmp/api.md && shins  --inline -o docs/index.html /tmp/api.md"
    dependsOn:
      - widdershins
      - shins
    install: npm install --global widdershins shins

```

As `optic.yml` is committed to the repository, everyone on the team now has access to this script, and it's available in our CI/CD pipeline as well. The first time it's run, if I don't have the dependencies already installed, Optic will let me know:

```
api scripts publish-spec
```

```
[optic] Found Script publish-spec
Checking bin dependencies Requiring ["widdershins","shins"]... Missing dependencies
[optic] Some bin dependencies are missing ["widdershins","shins"]. Run the command again with the flag '--install' to install them

```

My teammates will likely run into this issue as well. Plus, if we want to automate this process in our CI/CD pipeline, we'll want to be able to address missing dependencies. Optic Scripts handles this directly, and there's no need to configure extra tasks. We can resolve the missing dependencies by adding the `--install` flag:

```
api scripts publish-spec --install
```

```
[optic] Found Script publish-spec
Checking bin dependencies Requiring ["widdershins","shins"]... Missing dependencies
[optic] Some bin dependencies are missing ["widdershins","shins"]. false
Running install command: npm install --global widdershins shins ... ⣷

...

+ shins@2.6.0
+ widdershins@4.0.1
Running install command: npm install --global widdershins shins ... Success!
Generating OAS file...
[optic] Generated OAS files
[optic] /Users/lou/repos/example-ergast-project/.optic/generated/openapi.json
[optic] /Users/lou/repos/example-ergast-project/.optic/generated/openapi.yaml
Running command: widdershins $OPENAPI_JSON -o /tmp/api.md && shins --inline -o docs/index.html /tmp/api.md
Compiling all doT templates...
...

```

And success! The documentation is now available as a static web page, styled by `shins`. Anyone on my team can run the same script, just like I did, and also build the latest version of the API documentation. The CI/CD pipeline can use its existing task abilities to call the same Optic Script that my team and I use to update the documentation automatically as well:

![Optic documented API as seen in Shins](/img/blog-content/scripts-shins.png)

## Generating client code with OpenAPI Generator

Let's say I want to generate some client code as well, for various consumers. I might use a project like [OpenAPI Generator](https://openapi-generator.tech/) which can generate client code for various languages automatically from an OpenAPI specification. I know just where I can find that. Let's set up a script to generate a Ruby client from our Optic specification:

```yaml
  example-generate-client:
    command: "(export GEN_LANG=ruby; openapi-generator generate -i $OPENAPI_YAML -g $GEN_LANG -o clients/$GEN_LANG)"
    dependsOn: openapi-generator
    install: "brew install openapi-generator"
```

This command runs the command in a subshell, to keep things nice and tidy, so I can parameterize the language generated. Having our language parameterized will come in handy in a bit. Then, I can run the script:

```bash
api scripts example-generate-client --install
```

And now I have a `clients` directory, with a `ruby` subdirectory containing my generated client. Once I check in this change, anyone on my team can do the same. Let's say my team needs to publish clients in multiple languages. I can write a script for that:

```yaml
  example-generate-multiclient:
    command: "(for gen_lang in ruby typescript-node; do openapi-generator generate -i $OPENAPI_YAML -g $gen_lang -o clients/$gen_lang; done)"
    dependsOn: openapi-generator
    install: "brew install openapi-generator"
```

Now I can generate scripts for any `gen_lang` defined (in this case, `ruby` and `typescript-node` as defined by OpenAPI Generator). Indeed, I can see corresponding subdirectories under `clients` for each of these languages. In practice, I might break this out into a separate shell script to make it easier to read and then call the script from `command`. As my team adds multiple languages, this one-liner will become a really long line. In this case, I chose to keep it inline to demonstrate the quickest way to share products of my OpenAPI specification with my team.

Another practical observation: Both the `example-generate-client` and `example-generate-multiclient` scripts might be present in the same `optic.yml` file. I might want to generate a single client for local review when I'm working on a new feature, while I want my CI/CD pipeline to automatically generate the full suite of languages we need to support. Having separate scripts allows the concerns to be separated without needing to maintain a separate shell script.

## Get started with Optic!

You can start documenting your API today by [setting up Optic](/docs/) with your project. We can help you integrate with your existing documentation tools during our [office hours](https://useoptic.com/docs/community), and would be happy to take [feedback on GitHub](https://github.com/opticdev/optic/issues/new).
