---
title: "Solving Robozzle"
date: "2019-11-23T18:29:41.338" 
---

### A couple of years ago
I was in a class called problem solving. I have never had as much fun in any course and i've been through art school.
There was one assignment where we had to solve 10[^1] [Robozzle](https://robozzle.com) puzzles with increasing difficulty.
The first 8 were pretty easy with the last of those posing an interesting challenge. The ninth did however have me stumped and I could see no rhyme or reason to its layout. Thus I promptly decided to just write a program to solve it for me.

This turned out to be a bit more difficult than I anticipated but about 2 months worth of spare time later I had written a solver that could solve puzzle 9. The solver was written in [Julia](https://julialang.org) and utilized an EA(Evolutionary Algorithm) to find solutions.

### Robozzle
is a game 

The saying goes "When all you have is a hammer, everything is a nail". When you combine that with the Frequency illusion, also known as the Baader-Meinhof effect, you end with greedygrasping[^2]. I had recently learned about EA and may have greedygrasped the problem. 

I'm not going to explain EA in this article but you can read about the idea [here](https://en.wikipedia.org/wiki/Evolutionary_algorithm). An assumption of EA is that a partial solution[^3] 

[^1]: There were around 10 puzzles, not sure exactly but I assume they were 10 in this whole post.

[^2]: To **greedygrasp** is to apply newfound knowledge because of excitement for the knowledge, rather than its relevance to the situation. I just made this word up and am unsure if greedygrasp is the best word to describe this.
