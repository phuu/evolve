# evolve

A little experiment in evolving code to solve a simple maths problem: given a *target function*, over many generations, we breed and mutate the code that most closely approximates the target until we get it exactly right.

To run:

```bash
# argument is the body of the target function.
# it can use two random variables, i and j.
$ node evolve.js "i + 2"
$ node evolve.js "i + j"
```

## License

MIT
