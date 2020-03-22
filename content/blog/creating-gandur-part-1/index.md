---
title: "Creating Gandur (Part 1)"
date: "2020-03-20T20:00:56.904" 
topic: 
- "programming"
- "language design"
---

## Yet another programming language
After seeing&mdash;the beauty of [Julias](https://julialang.org/) type system, the speed of C,
the expressiveness of python, everything about scheme and more&mdash;I found myself spoiled
by a host of features. Unable to find a language that expresses what I think
a language could and should be able to express.

Designing a language has been a popular sport within academia for years.
The resulting languages were usually just used for research by one or a few people.
No matter how well the language was designed, the performance would always pale in comparison to GCC, MSVC and the Clang compiler.
With the maturing of LLVM; the difficulty of making a highly performant was greatly reduced.
The only requirement is to make a frontend that generates unoptimized LLVM IR and LLVM would take care of 
generating fast native assembly from it.
This has led to a renaissance of systems level languages like [rust](https://www.rust-lang.org/), [zig](https://ziglang.org/), [Odin](https://github.com/odin-lang/Odin) to name a few.

## The language I want
* is a language that lets me write concise high level concepts into functioning programs, much like Python.
* It lets me optimize the slow part of the high-level code until it is as fast as C, within the same language.
* It infers types and lets me declare and infer types, similar to Python but in a performant manner, like Julia.
* It respects that memory management is central to performance by:
  * Exposing C like malloc and alloca, requiring a call to `free(...)`.
  * Enabling specialized allocators(like arena and multi pool).
  * Letting me mark memory to be reference counted.
  * Utilizing [RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization) or scope based resource management where possible.
  * Otherwise, falling back to garbage collection.
* It is no slower than it needs to be, i.e. a boxed type can be slow but operations on known types should be as fast as C, much like in Julia.
* Lazily includes only features that are actually used e.g.:
  * If all memory is managed C style, the GC and the reference counting systems aren't in the binary. 
  This way the binary can be small enough for embedded use and the like.
  * If all types are declared or inferrable at compile time, the type inferance system is omitted from the binary.
  * If complex metaprogramming facilities are used, the whole compiler will probably have to be included in the binary.
* Every feature can be disabled for a project, a file or scope. 
  * This complements the lazy inclusion feature. 
  * This would cause a compilation error if, for example, the GC is given memory within a region marked `no_gc`.
  
## [Jörmungandur](https://en.wikipedia.org/wiki/J%C3%B6rmungandr)
is a mythical creature from norse mythology that eats its own tail.
Inspired by [scheme](https://en.wikipedia.org/wiki/Scheme_%28programming_language%29),
I wanted my language to be able to manipulate, evaluate and consume itself through metaprogramming. 
Ouroboros was an obvious name that came to mind but it was both taken and a bit too obvious.
Then I thought of my local ouroboros, Jörmungandur[^1] but found the name too long to be marketable.
I shortened it to **Gandur** which happens to mean 
a magic staff, a rideable animal or the archaic meaning, a dangerous beast.
In Faroese[^2] it means black magic which I find quite fitting.
Galdur is Icelandic for magic or spell so this is all related.

## Type systems
Dynamically typed languages are often associated with productivity. They do however have the drawbacks
of worse performance and more surprising bugs[^3]. For this reason, some people prefer greater compile time safety
and predictable performance of languages like C/C++, rust, go, etc. I found Julia to strike a nice balance with its 
type inference system. Julia has a type hierarchy and system that infers the types being used in computations
and JIT compiles the used functions for those types. Everything that has a type can be annotated with types
to aid the compiler in optimizing and to catch errors when something has a type the programmer doesn't expect.

Gandur is to have a type system inspired by the one in Julia. It is a key feature in Julia's attempt to
combine high level expressivity with low level speed. 
There are [a lot of caveats](https://docs.julialang.org/en/v1/manual/performance-tips/) with Julia's system
and I intend to err on the side of performance or at least emit warnings when slowdown prone patterns are used.


[^1]: The modern spelling is Jörmungand**u**r while the old one(used on the wikipedia page) omits the u.
[^2]: Faroese is Icelandic's closest relative and is similar enough that native speakers of one can undestand one of the other if they speak slowly.
[^3]: This should be familiar to anyone who has encountered javascript's [Abstract Equality Comparison Algorithm](https://www.ecma-international.org/ecma-262/10.0/index.html#sec-abstract-equality-comparison), better known as `==`.
