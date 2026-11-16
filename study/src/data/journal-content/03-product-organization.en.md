These chaotic two weeks have made me think about a lot.

At first I only wanted to improve the prototype in front of me: straighten out the interaction logic and present the product more completely. But as I kept revising it, I began to feel that many design problems are not really design problems.

If a product has not figured out its shape from the start, the design work that follows becomes painful.

Every new business need feels like another patch on top of the old structure. Today we add an entry point, tomorrow a page, and the day after we discover that the user path does not make sense and have to reorganize it again.

Designers can get trapped in an endless cycle of rework.

I have become increasingly aware that the hardest part of prototyping may not be the interface, but the logic behind it.

Why is a product organized this way?

Why does a user enter from here?

How are different tasks related?

Can the structure keep growing when new business is added?

When these questions have not been thought through, they show up in design as endless revisions. (This is where I really want to roll my eyes 🙄. Our product manager knows the business better than anyone on the team, but “understanding the business” and “building a product” are two different things. Understanding the business means knowing what clients need now, how to move a project forward, and how to solve today's problem. Product work also requires another ability: abstracting patterns from specific needs and thinking about what the product should become in the future. But small teams have limited resources, and one person often has to do many things at once—communicate with clients, move projects forward, follow development, and deal with unexpected issues. When you live in that many threads at once, it is hard to reserve enough time to think about the product's shape. I will put my eye-roll away here 🙄. The difficulty is not one person's ability; it is the organization itself. When everyone is pushed forward by business needs, each person is solving the immediate problem, and few people can stop to ask a larger question. That is why I have come to think that the difference between a small company and a large one may not be only resources, but whether there is space and a mechanism for people to step away from immediate tasks and think about long-term direction. A small company has the advantage that everyone can participate in many things: designers can join product discussions, and engineers can influence the product's shape. The cost is that everyone is also more likely to be buried in concrete tasks. Looking back, I feel conflicted. I get anxious when a product's form was not settled in advance and feel that some rework could have been avoided. But I also understand why people in that position act as they do: when someone handles too many things every day, thinking itself becomes a luxury. 🙄🙄🙄)

During this period, I made a fairly major change to the shape of our product.

Before I joined, it was closer to a traditional SaaS product.

Different digital coworkers each had their own workspace.

A user who wanted to write a tumor report would enter the tumor-report workspace; someone preparing a quotation would enter the quotation workspace; someone doing a review would enter the review workspace.

That logic was not wrong.

But later I reconsidered who our users are.

The people we serve are not usually individuals completing one isolated task.

More often, they belong to an organization.

An enterprise may have many projects at once, and each project may contain many different tasks.

For example, a drug-efficacy research project might involve writing a report, preparing a quotation, conducting a quality review, and eventually coordinating other workflows.

So I changed the structure to “project–task.”

A project provides the larger context. It contains multiple tasks, and each task can call on a different digital coworker.

That change felt important to me.

It changed how I understand agent products.

Before, it felt more like adding AI somewhere inside an existing business process.

You start with the old workflow and find a way for AI to improve one step.

Now I wonder if an AI-native product should work the other way around.

Instead of adding AI to the business, perhaps the logic of AI should reorganize the business.

This is still an exploration; I cannot say whether it is the right answer.

But it has at least made me feel that a product should not be a stack of capabilities.

Another strong impression is that AI products still do not have a stable dominant design.

The Ford Model T is an imperfect but useful comparison. Before it appeared, a car could look like a carriage or a steam locomotive; people tried many different forms. The Model T helped settle expectations around four wheels, an internal-combustion engine, and assembly-line production.

AI products are still in a fluid stage.

A chatbot can work; a canvas can work; node-based editing can work; a split-screen layout can work. Many forms make sense on their own, but none yet covers every business.

I think a product therefore needs two parts.

One is a stable shell for work.

Its basic structure should stay consistent because people need a stable mental model.

The other part should stay open, able to grow and change.

I have been following Tencent WorkBuddy's integration with Tencent Docs. It is an interesting move toward enterprise use: people can edit, share, and collaborate in the same Agent task document, and in a sense coordinate multiple agents. For Tencent, this connects products from an existing, mature ecosystem.

Similarly, Feishu has been brought together with Doubao. Doubao for enterprise is now connecting to Feishu's organizational knowledge and collaboration tools, so that—with authorization—it can use Feishu documents, spreadsheets, and calendars and deliver results people can keep editing and working on together. I think this combination of “an LLM entry point plus a mature collaboration ecosystem” is a pattern worth watching in enterprise AI.

But it is also a reminder that we cannot simply copy the product forms of large companies.

Tencent already has Tencent Docs, WeCom, and WeChat. ByteDance already has Feishu and its documents, spreadsheets, and organizational system. When they build online editing and collaboration, they are connecting mature products they already own.

We do not have the same ecosystem. Investing heavily in building a new online document editor could cost a great deal without creating a real advantage.

So at the moment I lean toward keeping Chatflow as the main workspace.

The right side can handle previews, evidence, deliverables, and a few lightweight actions, but it does not need to become a full online office suite right now.

Our differentiation should lie more in:

- Understanding pharmaceutical business
- The professional capabilities of digital coworkers
- Handling business files and context
- Professional review workflows
- Traceable relationships between data, tasks, and deliverables

In other words, we should not compete with large companies on a general office ecosystem. We should make vertical-industry agents more professional and trustworthy.

Another question I have been thinking about is how to turn agent capability into a product.

When we talk about AI products, we often focus on the interface.

But the core of an agent product may not be its UI. It may be the chain of capabilities behind it.

Right now, I do not think we have a very clear methodology for this.

Technology keeps trying new implementation approaches.

Product focuses more on business needs.

Design is responsible for the final presentation.

But in between, we lack someone who can turn agent capability into product experience.

That is a direction I would like to explore in the future.

I recently wrote down a few things I want to do next.

First, learn Python.

Not because I want to become a full-time developer, but because in the AI era it is not enough to rely only on natural language to change code.

AI coding is powerful.

But if I cannot read code at all, I am still very passive when something goes wrong.

I want at least to be able to read code, understand its structure, and do simple debugging.

Second, study agent productization systematically.

That includes agent architecture, tool use, memory, RAG, workflows, and process visualization such as HANA and Trace.

Third, learn automated evaluation—Eval.

AI products will not be able to rely only on human impressions to judge whether they work well.

Knowing how to evaluate an agent's capabilities will become very important.

Fourth, I hope to build complete projects on GitHub.

Not only frontend, and not only visual design.

I want to try to build a complete loop.

AI coding lowers the cost of execution. What matters more is whether I can define a complete problem and bring it to life.

Another thing from this internship has stayed with me: the organization itself.

Recently there has been a large amount of movement in the company. Many people have left, and many people have joined. I have found the change a little hard to adjust to.

This is the first time I have been close enough to feel that a real organization is not a relatively stable group like one at school.

In school, a class or club shares a stretch of time, and someone's departure tends to leave a visible mark. At work, I first saw how strongly an organization can absorb people coming and going.

Someone works there for a while, invests a lot of energy, collaborates with many people, and eventually leaves.

A few days later, new work is still moving forward, new colleagues arrive, and everyone keeps opening new meetings.

For the person leaving, it may be painful.

For those who stay, the event may soon be covered over by new work.

It gave me a strange feeling.

It was a little as if a person had been “abstracted” within the organization.

It is not that people have no feelings. But once an organization has been running long enough, people moving in and out can become an ordinary part of life.

One person leaves today; perhaps another will leave tomorrow.

Over time, people may develop a protective mechanism and avoid investing too much emotion.

If every departure caused a huge emotional upheaval, an organization might not be able to function.

But for me, this experience is precious.

It is the first time I have felt this kind of change so directly.

As someone just entering professional life, I have not seen many cycles of people leaving. I still feel something real when someone goes.

I think:

Someone who once took part in all of this is leaving.

Their experience, effort, and ideas may no longer take part in the organization's future.

Maybe in a few years, after I have lived through more departures, I will gradually get used to them too.

On one hand, I understand why an organization has to work this way.

A company needs efficiency, must keep adjusting, and has to reallocate resources as business changes.

On the other hand, I do not think a person can be treated entirely as a variable in an organization.

A person's worth should not be measured only by how much output they can produce right now.

The problem with modern organizations is not a lack of human feeling. It is that, once a system has been running long enough, people can easily be reduced to a role, a set of responsibilities, or a line on a résumé.

Someone else may be the one leaving today, but in a way the moment reminds my future self:

Do not become so used to the rules of an organization that you forget that every person sitting beside you is a whole person.

I think this is one of the more important things I have felt during my first time in the workplace.

I used to care more about whether the work could be done well and whether I could improve my abilities.

Now I am beginning to see that an organization is not only a set of processes and divisions of labor. It is also many specific people sharing part of their limited time and experiencing things together.

Finally, if I had to describe the biggest change in me during this period, it may not be how many tools I have learned.

It is not how many pages I have made.

It is that I have begun to realize that many things have no standard answer.

Not products.

Not design.

Not organizations.

Often, all we can do is form our own judgment in an environment that keeps changing.

I still do not know exactly what role I want in the future.

Maybe design.

Maybe product.

Maybe something closer to product engineering or design engineering.

But I do know that I do not want to stop at executing a question someone else has already defined.

I want to know:

Why does this problem exist?

How should it be defined?

And can we create a better answer?