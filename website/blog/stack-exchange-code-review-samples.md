---
date: 2021-10-20
title: "Code Review Stack Exchange: Get a Second Pair of Eyes on Your Code"
author: James Konik
category: Community
description: Hey all, it's Aidan, one of Optic's creators 👋. I'm here to share a preview of the cloud version of Optic
---

[Code Review Stack Exchange](https://codereview.stackexchange.com/) allows users to post code for others to review. It’s essentially an open code review that anyone can contribute to, and is part of the same [Stack Exchange](https://stackexchange.com/) network as the ubiquitous Stack Overflow.

But where Stack Overflow focuses on solving specific problems, Code Review Stack Exchange is there to [help improve existing code](https://codereview.meta.stackexchange.com/questions/5777/a-guide-to-code-review-for-stack-overflow-users). 

<!--truncate-->

In this article you’ll learn how you can use it to help improve your own code.

## Why Code Reviews Can Help You

Coders are often intensely focused on their work, but they can get too caught up in the details to view their work objectively. It is also hard for them to assess readability and understandability, since they (hopefully) already know why they wrote the code a certain way.

Evaluation from another pair of eyes can give a more balanced appraisal of your work. Code should convey its intent to those who didn’t write it, and a review can highlight unclear sections. You can also benefit from the wisdom of more experienced coders, who can point out better ways to do things.

Improving your code can also bring performance gains. Getting an algorithm right can have huge benefits in terms of speed. 

Finally, reviews can help make your code more robust. Catching errors improves your final user experience and can, [perhaps literally](https://www.newscientist.com/gallery/software-bugs/), prevent disaster.

## Stack Exchange Code Review Samples 

Let’s take a look at some specific reviews. These examples should give you an idea of what you can learn from the site, and maybe some ideas for how you can improve your own code.

There are many more reviews on the site, so if there’s a particular language or algorithm you’re having trouble with, take a look and see if you can find it.

Each review contains a link to the code under discussion.

### Review One - [Python 2048](https://codereview.stackexchange.com/questions/268160/2048-in-python-pygame)

This recent review is of a full, working game written in Python, using the Pygame library. It’s a version of block sliding puzzler 2048, itself a clone of the [original Threes](http://play.threesgame.com/). 

![Python code from 2048 clone, with several functions included](/img/blog-content/secr-python-2048.png)

This review has so far received a couple of useful tips on naming: rename the methods to be more verbose and include verbs in the method names. 

This is valuable advice that can improve all the poster’s code in the future and make it easier to work with, both for the poster and especially for others. Making this code more professional will also make it more attractive to employers.

Someone has also commented that the game is a little easy in its current form. That kind of feedback can help the poster improve the overall game to make it more enjoyable, improving the final user experience.

### Review Two - [Python Chess Game](https://codereview.stackexchange.com/questions/267644/first-attempt-at-chess-in-python)

Here’s a more established review with more discussion around it. It’s a Python chess game, broken into several classes.

This is still quite basic but contains useful advice on code organization.

![A demonstration of a more efficient use of code](/img/blog-content/secr-python-chess.png)

One comment mentions the duplicate code in the move logic. Each piece has its own class with its own code for figuring out its legal moves. To fix that, common functions, such as a piece not being able to land on its own square, should be in a base class.

Once again, there are helpful general tips—“don’t repeat yourself” is sound advice for anyone, and there are suggestions on renaming variables to fit Python’s conventions. 

Using `check_move` instead of `checkMove` is better practice, as is using lowercase package names.

Naming conventions are important in professional settings, and getting them right is a useful habit for junior coders to adapt. They make code more consistent and readable. They also save you the trouble of having to adjust them if they’re wrong the first time around.

### Review Three - [The Collatz Sequence](https://codereview.stackexchange.com/questions/266408/my-recursive-attempt-at-collatz-sequence-in-python) 

Let’s move on to something a little more advanced.

In this case the poster has written a recursive algorithm implementing the [Collatz sequence](https://en.wikipedia.org/wiki/Collatz_conjecture). There’s not much code there, but since it can potentially run many times for a single function call, there is plenty of scope for small changes to make a big difference in its run time.

Getting this right can reduce CPU load, saving you server time or helping your application run faster. Speed gains like those discussed are easy to find when focused on one section of code, but much harder to find once this has been absorbed into a larger codebase.

Someone suggested converting the input to an integer, as the Collatz sequence only contains those. That has speed and memory advantages and will help filter out incorrect input. 

User “N3buchadnezzar” has provided another excellent answer explaining how to optimize the code by caching the recursive function calls. 

This saves time here, as calls with large values often repeat calls to lower values. Using a Python decorator makes this a painless change.

Their answer includes a detailed explanation, optimized code, and benchmarks showing the difference it makes.

![Code for benchmarking the sequence](/img/blog-content/secr-collatz.png)

This has improved the code execution speed from 12.444 to 0.332 seconds. An impressive result, and one that could make a huge difference to processing costs if scaled up. It also allows you to go much further in calculating numbers in the sequence.

### Review Four - [Thread-Safe Queues in C++](https://codereview.stackexchange.com/questions/267847/thread-safe-message-queue)

In this review, the poster has written some inefficient code for building a thread-safe queue.

![Code showing shortened main class](/img/blog-content/secr-thread-safety.png)

The top responder splits the code into two classes to divide responsibility appropriately. Their code also uses the queue class from the standard library. Using standard libraries is generally a better idea than rolling your own code, and it is common for inexperienced coders to be unaware of everything available to them.

Using `std::lock_guard()` instead of unlocking and locking threads manually is recommended to avoid problems.

They have also given a thorough list of general pointers, such as allowing the threads to terminate gracefully. 

Avoiding copying items by using `pop()` before they’re finished is another good recommendation. There are also suggestions for avoiding the limitations that this imposes.

Implementing these tips will make the queue more efficient and less likely to lock. 

## Tips for Using Code Review Stack Exchange

Here are a few quick tips for getting the most out of the site.

### Don’t Share Secrets

Sensitive data should not be posted publicly. This sounds like common sense, but as [several high-profile leakages](https://qz.com/674520/companies-are-sharing-their-secret-access-codes-on-github-and-they-may-not-even-know-it/) show, it’s not as obvious as you’d hope.

Don’t put passwords online. Of course, it’s easy to paste a bit of troublesome code and forget that there’s an ID or OAuth code lurking at the top somewhere. Remember to check before you paste or suffer the consequences, which could include lawsuits and the loss of your job.

### Be Careful About Sharing Work Code

As with the above, you’d hope this also would be obvious. For many coders, not all the code we work on is ours, so check if the owner is comfortable with it being shared. It’s quite common for code you’re not confident with to have a few lines absorbed from elsewhere, so check its source and at least provide credit where it’s due.

You should also be aware of the license implications when submitting your own code. As [a comment here](https://dev.to/_bigblind/quick-tip-check-out-the-code-review-stack-exchange) points out, anything that crosses the threshold of originality for copyright purposes can automatically fall under a Creative Commons license if you post it on the Stack Exchange network. If you don’t want that, be careful.

### Give Back to the Community 

To truly participate, don’t just ask for help—help others. Not only is this the right thing to do, it can help you develop your own skills. Explaining things you understand is a great way to discover you didn’t understand them as well as you thought you did.

Helping others also allows you to make connections and build your reputation. Plus, it just makes the world a better place.

### Provide Context and Explanations

Code Review Stack Exchange is for improving working code, not fixing bugs. Just posting code that works isn’t always enough. 

When coders make difficult choices, there isn’t always a single “right” answer. The decisions you make will depend on things like your users, your goals, and your deployment environment. Perhaps you’ll prioritize speed if you’re serving many customers. If you’re working on a science paper, accuracy may be more important.

For people to help you as effectively as possible, they need to know what your code is for. Help them out and give them some context. Explain things thoroughly and you’re more likely to get answers that move your code in the direction you need.

### Code Reviews Are a Skill, Too

Just like coding, code reviews are something you can get better at. There are [things you can do to improve](https://www.chakshunyu.com/blog/5-actionable-tips-to-deliver-higher-quality-code-reviews-today/?utm_source=reddit&utm_medium=social&utm_campaign=r_programming), such as communicating clearly, following up on discussions, and understanding how best to help the code author.

Practice makes perfect, as does reading through other posts and learning how people have contributed. Looking through the higher-rated posts on Code Review Stack Exchange will help you understand what works, and there are plenty of articles discussing the topic if you want to improve further.

## Conclusion     

Code reviews help make you and your work better, and Code Review Stack Exchange is a great forum to do this. Read through it and if you like it, make some contributions. It’s different enough from Stack Overflow to be worth your time.

Aside from code reviews, there are plenty of other ways to give yourself an advantage. [Optic](https://useoptic.com/) is a useful tool that lets you [track and review changes to your APIs](https://useoptic.com/blog/how-to-discuss-api-changes-during-code-review/). It’s a great way to spot errors that reviews and tests can both miss. Check it out if you’re building APIs and could use some help keeping them error-free.

---

import OpticCloudFooter from '../src/pages/_optic-cloud-footer.mdx';

<OpticCloudFooter />
