---
title: Using IntelliJ with Optic
sidebar_label: IntelliJ
slug: /intellij
---

## Set up a shell script

To start, you'll need to set up a shell script to run Optic with IntelliJ. There are options to avoid doing this manually, such as the [BashSupport Pro plugin](https://www.bashsupport.com/pro/), if you've already purchased or subscribed to them. They come with added features you may find useful, though for today we'll focus on what's built in to IntelliJ. We're also assuming Optic is already installed on your system. You *do* have Optic already, don't you? If not, no worries: [installation is quick](https://www.useoptic.com/docs/) through several package managers such as Yarn, NPM, and Brew.

For a simple demonstration, we'll create a trivial file `optic.sh` that will just call the Optic `api start` command to run a project through Optic. It won't do anything yet: we'll set that up next. For now, create the following `optic.sh` file in the root of your API project:

``` bash
#!/bin/sh

api run start 
```

## Integrate Optic with a project

Just like Git, Cargo, or many other coding tools, the first step for integrating any project with Optic is initializing Optic. In the root directory of the project, run `api init`. This starts the Optic daemon and opens a setup window in your browser. The setup process walks you through integrating with your project so Optic can observe traffic to your API.

![Running api init](/img/blog-content/intellij-api-init.png)

Here we've selected the Proxy integration. This allows us to set the port on which our application runs with the IntelliJ run configurations, and gives us a place to pass traffic through Optic. Our API project runs on port 8080, so the targetUrl is `http://localhost:8080`. Optic will observe and forward traffic sent to `http://locaalhost:4000`, which is how we'll test our work as we develop. 

Optic guides us to check our configuration. Go ahead and start your project with the Green Play button next to the Run Configurations in IntelliJ, and wait for it to start up. Then, run `api check` from the terminal. Optic will run some tests and make sure the configuration is right. If there are any issues, it will enumerate them and provide some suggested remedies. When all is set up properly, you'll get a check passed message.

![API Check passed](/img/blog-content/intellij-api-start.png)

The Optic installer tells you to run `api start`, which will work. However, we can integrate this command with the IntelliJ Run Configurations so Optic will run with your existing configurations and even with your existing debugger.

## Setting up Compound Run Configurations

IntelliJ has the capability to manage multiple run configurations together. Here, we'll bundle the API project's existing run configuration with the `api start` command. On the Run/Debug Configurations drop-down, select **Edit Configurations...** Click the **+** icon to add a new configuration, and choose the **Shell Script** template. We'll invoke the shell script we wrote earlier, by setting the script path to our `optic.sh` script. Set your working directory as well. It's not needed for our simple script, though if you add on to it later it will save you some time.

![Setting up an Optic run configuration](/img/blog-content/intellij-run-optic-configuration.png)

The Shell Script Run Configuration will run the Optic proxy on its own, but we want to couple this with our API project. Back under **Edit Configurations...** click the **+** button again and this time select the **Compound** template. Set the **Name** to `Run w/Optic` and add both your current API Project run configuration and our new Shell Script. 

![A compound run configuration with Optic](/img/blog-content/intellij-run-optic-compound.png)

From now on, you can use the **Run w/Optic** configuration in IntelliiJ. It will run your API project exactly as it always has run before, and bring up Optic alongside it. Notice we haven't yet mentioned what language we're using in our project. Through this example I used a sample Spring project built with Gradle, but this setup would work with any language, framework, and build tool. By using Compound configurations, Optic runs alongside the project you have already set up. 

That means it also works with all of the run commands, including Debugging. You may get some odd logs when debugging as stepping through the code may lead to timeouts in the Optic proxy, much like any client application or browser would time out when debugging. This is normal and expected, and shouldn't cause any additional complications.

## Following Through

Optic integrates well with IntelliJ, sitting in the Run Configurations behind "the green start button" used to start projects today. You can [get started with Optic](https://www.useoptic.com/docs/) and tailor your integration to your needs. Please [reach out to us](https://github.com/opticdev/optic/issues/new) if you have any issues, or set up time to [chat with the Optic team](https://calendly.com/optic-onboarding/setup-help) to go over your use case.

## Resources

- [IntelliJ Community edition 2020.2](https://www.jetbrains.com/idea/download/)
- [Spring Guides: gs-rest-service](https://github.com/spring-guides/gs-rest-service) (using the "complete" folder as the project root)