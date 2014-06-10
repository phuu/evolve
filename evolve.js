//console.clear();
console.log(Date.now());

Number.prototype.fws = function(length) {
    var str = ''+this;
    while (str.length < length) str = str + ' ';
    return str.slice(0, length);
}

/**
 * Calculate a score according to the absolute delta from `res` to `expected`.
 *   delta = 0, deltaScore = 1
 *   as delta -> infinity, deltaScore -> 0
 */
function deltaScore(res, expected) {
  return 1 / (1 + Math.abs(res - expected));
}

/**
 * Use `i` to score a the `code`, comparing its value to the `expected` one.
 */
function score(data, code, expected) {
  var res;

  // Comment? Dead.
  if (code.indexOf('//') > -1) {
    return 0;
  }

  try {
    with(data) {
      res = eval(code);
    }
  } catch (e) {
    // Threw? Dead.
    return 0;
  }

  // NaN? Dead.
  if (isNaN(res)) {
    return 0;
  }

  // Wrong type? Dead.
  if (typeof res !== typeof expected) {
    return 0;
  }

  // Produce a score based on the delta from result to expected
  return deltaScore(res, expected);
}

/**
 * Generate a random string of length `length` using from the `chars` below.
 */
function generate(length) {
  var chars = '1234567890-+/*ij ()';
  var result = '';
  while (length--) {
    result += chars[~~(Math.random() * chars.length)]
  }
  return result;
}

/**
 * Given a `generation` (array of code strings) and a `targetfn` function, rank how well the code
 * does compared to the expected value that the target produces using the `score` function.
 */
function rank(generation, targetfn) {
  return generation.map(function (code, i) {
    // Run 10 tests and average them
    var tests = 10;
    var total = 0;
    var a = tests;
    while (a--) {
      var i = ~~(Math.random() * 100);
      var j = ~~(Math.random() * 100);
      total += score({
        i: i,
        j: j
      }, code, targetfn(i, j));
    }
    return {
      code: code,
      score: total / tests
   };
  }).sort(function (a, b) {
    return b.score - a.score;
  });
}

/**
 * Breed two strings to produce a child, by randomly swapping or mutating characters. There's a 50%
 * chance of mutation.
 */
function breed(a, b) {
  var code = a;
  var swaps = ~~(Math.random() * a.length) + 1;
  while (swaps--) {
    var i = ~~(Math.random() * a.length);
    var ch = (Math.random() > 0.4 ? generate(1) : b.slice(i, i + 1));
    code = code.slice(0, i) + ch + code.slice(i + 1);
  }
  return code;
}

/**
 * =============================================================================
 * =============================================================================
 */

// Set up the target
var targetfn = new Function('i', 'j', 'return ' + process.argv[2])

// Don't go forever
var MAX_GENERATIONS = 10000;
var generation = [];
var generationSize = 500;
var i = generationSize;
// Generate an initial, totally random generation
while (i--) {
   generation.push(generate(7));
}

var averageScore = 0;
var generations = 1;

// Do the first ranking
var ranked = rank(generation, targetfn);
var best = ranked[0];
run();


/**
 * Run the simulation!
 */
function run() {
  generation = [];
  // Choose the mother & father of the next generation (highest scoring and not equal)
  var mother = ranked[0].code;
  var fi = 1;
  var father = ranked[fi].code;
  while (father === mother) {
    fi += 1;
    father = ranked[fi].code;
  }
  // Now generate a generation by breeding many times
  var i = generationSize;
  while (i--) {
    generation.push(breed(mother, father));
  }
  // Rank the resulting generation
  ranked = rank(generation, targetfn);
  // And pick out the best score
  best = ranked[0];
  // Nasty, not really average
  averageScore = (averageScore + best.score) / 2;

  console.log(
    generations.fws(10),
    best.code,
    '->', best.score.fws(10),
    '      ',
    'AVG', averageScore.fws(10)
  );

  generations++;

  // Keep going till we have the perfect score
  if (generations < MAX_GENERATIONS && best.score < 1) {
    setTimeout(run, 20);
  }
}
