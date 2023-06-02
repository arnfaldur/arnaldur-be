---
title: "Solving Robozzle (Part 2)"
date: "2020-03-05T17:11:29.185"
topic:
    - "programming"
---

### In 2019

I wanted to revisit the robozzle solver experiment from my early days of programming and see if I could improve on it. Unfortunately I have been unable to locate the old project directory and suspect that it might be lost to entropy.

At this point I had the idea of making a solver that used Monte Carlo tree search to find solutions. I discovered this algorithm through DeepMind's AlphaZero that couples the approach with deep convolutional neural networks to play go, chess, and shogi at an expert level.

Each candidate can take thousands of steps to evaluate and I remembered my extensive profiling sessions from the last time. Thus I wanted to use a fast language this time. Although Julia is very fast relative to its expressivity, I decided to go for a non-garbage collected language[^1]. I chose Rust.

#### Monte Carlo Tree Search

also known as MCTS, was the first strategy I tried.
My idea was that the solution space could be thought of like a tree.
The root is the empty candidate and its branches are the candidates with one symbol,
their branches have two, etc.
I tried multiple methods to evaluate the partial candidates using a fitness function, similar to the GA.
I tried multiple statistical methods to guide the tree search including using the elusive [beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). Some of them were quite involved but I suspect that they didn't really work because dealing with a robozzle puzzle's solution space probabilistically doesn't really make sens.

This method did not seem to be good at finding solutions and I was only able to make it solve very simple puzzles. The explored part of the tree was kept in memory which took a lot of space. I suspect a lack of cache locality and memory bandwidth reduced the performance, making this questionably applicable algorithm slow as well.

#### Backtracking

is the next thing I tried. It is simply a [DFS](https://en.wikipedia.org/wiki/Depth-first_search) through the solution space that tries to avoid too much work by finding branches that can't lead to a solution and not exploring them.

[^1]: I have heard claims (mostly from the world of D) that garbage collection's reputation far exceeds its downsides so my reasoning might have been unfounded.
