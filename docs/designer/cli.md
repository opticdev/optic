# Running Seamless Locally

We believe it's important that you control your API specification so we do not require you to save them in our cloud. We built a lightweight CLI that lets anyone on your team view and edit the spec by running 'api spec'. Like everything else we've built, it's open source and free to use. All the data and computation is checked into your git repo.


> If you have the API Designer open in your browser click 'Share' and follow these instructions there.

1. Install the CLI from NMP
```bash
npm install @seamlessapis/cli -g
```

2. Initialize a Seamless Spec in your Repo
Now we need to initialize Seamless in your repo.
```bash
cd /path/to/api/
api init
```

You'll see a folder called '.api', this stores a changelog of all the changes made to your API. There's also a ReadMe to help your teammates get setup -- you might want to add a few lines at the top explaining what you liked and dislike about Seamless.


3. Open the editor locally
```bash
api spec
```

That's it! Your team can use Seamless to design and document your internal APIs!
