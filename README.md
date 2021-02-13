# Boids! - Flocking Simulator

Boids, created by Craig Reynolds, are a form of artificial life that simulate the behaviour of birds, fish, and other flocking animals.
The behaviour of the boids is determined by three simple rules:

- Separation: The boids avoid crowding each other
- Alignment: The boids try match the velocity of the other boids
- Cohesion: The boids move towards the center of mass of the other boids

I have added a few more extra rules to make it more interesting:

- Wall avoidance
- Barrier avoidance
- Random noise
- Predator boids, called droids, that the other boids try to avoid, while the droids to chase

Read more on the wikipedia article [here](https://en.wikipedia.org/wiki/Boids)
