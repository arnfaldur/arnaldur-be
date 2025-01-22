<!--
--- 
geometry: margin=2cm 
---
-->

# Large Language Model Reasoning

There is an idea floating around, which has some traction, that LLM intelligence
is illusory. LLMs are an impressive piece of technology, capable of generating
text of higher quality than an average person. As is common---when the magic
wears off and the initial hype dies down---a counter culture forms around the
best ideas of cynics, skeptics, and those who were never impressed.

In this article, I use the words LLM and model interchangeably. I am
specifically referring to modern (in mid 2024) transformer based large language
models, models inheriting from OpenAI's GPT models. These include Llama, Qwen,
Phi, and others. They do not include newer recurrent neural network inspired
models like Mamba, whom have yet to prove themselves.

LLMs tokenize text into **tokens** which get turned into **embeddings**. They
processes the embeddings through their layers, and finally turn the embeddings
back into tokens, and the tokens into text. Embeddings can be considered to be
the thoughts of an LLM. **Attention** is a mechanism that allows the LLM to
_attend_ to the embeddings processed in previous forward passes. For a more
thorough overview of the architecture, see its
[wikipedia page](<https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)#Architecture>).

## _Just_ a next-token predictor

[Search for "token predictor" on X for context](https://x.com/search?q=token%20predictor).

LLMs are \'_just_ a next-token predictor\'. The only problem with this phrasing
is the implication of the use of the word \'_just_\'. Architecturally speaking,
LLMs are designed to estimate the probabilities of tokens, making them
next-token predictors as a matter of fact. That is no small feat, however. The
implication is that they can't possess real intelligence.

Let's consider a hypothetical situation in the year 2000. A group of people
receive funding to create an API that performs next-token prediction. The tokens
predicted by the API should be, above all else, as human-like as possible. It
can come at the cost of high latency and low throughput. The group would look
into the state of the art in natural language processing research and find that
we had some ways to go. Ultimately, the best solution would be to place humans
behind the API. They hire people to man the API and create a system to divvy up
the prediction tasks.

This API would be expensive and slow, but it is a next-token predictor, you
might even say that it is _just_ a next-token predictor. If we control for the
latency of the API, there is no way to tell what process is behind it, similar
to modern LLMs.

The humans behind the API possess real intelligence, and by extension, so does
the API. Therefore, the intelligence implication falls apart, as something being
a next-token predictor doesn't preclude it from possessing real intelligence.

There are
[pitfalls with next-token prediction](https://arxiv.org/abs/2403.06963 "arXiv:2403.06963 The pitfalls of next-token prediction"), but
they are issues with the interface to the intelligence, not the nature of it.

## Further reading

This document is an excerpt from a longer article that is available at my personal website: [arnaldur.be](https://www.arnaldur.be/writing/about/large-language-model-reasoning).
