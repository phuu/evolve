//console.clear();
console.log(Date.now());

Number.prototype.fws = function(length) {
    var str = ''+this;
    while (str.length < length)
        str = str + ' ';
    return str.slice(0, length);
}

// CODE

var weight = {
  eqeq: 0.4,
  i: 0.1,
  // len: 0.15,
  dist: 0.5
};

function dist(res, expected) {
  return 1 / (1 + Math.abs(res - expected));
}

function score(i, code, expected) {
  var res;

  if (code.indexOf('i') < 0) {
    return 0;
  }
  if (code.indexOf('//') > -1) {
    return 0;
  }

  try {
    res = eval(code);
  } catch (e) {
    return 0;
  }

  if (isNaN(res)) {
    return 0;
  }

  if (res === expected) {
    return 1;
  }

  return dist(res, expected);
}

function generate(max) {
  var chars = '1234567890-+/*i ()';
  var length = max;
  var result = '';
  var i = 0;
  while (i < length) {
    result += chars[~~(Math.random() * chars.length)]
    i++;
  }
  return result;
}

function rank(generation, targetfn) {
  return generation.map(function (code, i) {
    var tests = 10;
    var total = 0;
    var target;
    var i = tests;
    while (i--) {
      target = ~~(Math.random() * 100);
      total += score(target, code, targetfn(target));
    }
    return {
      code: code,
      score: total / tests
   };
  }).sort(function (a, b) {
    return b.score - a.score;
  });
}

function breed(a, b) {
  var code = a;
  var swaps = ~~(Math.random() * a.length) + 1;
  while (swaps--) {
    var i = ~~(Math.random() * a.length);
    var ch = (Math.random() > 0.5 ? generate(1) : b.slice(i, i + 1));
    code = code.slice(0, i) + ch + code.slice(i + 1);
  }
  return code;
}

// UTILS

// assert(true === false, 'True is false', { some: ['optional', 'data'] })
var assert = (function (calls) {
  return function assert(passed, msg, data) {
    console[passed? 'log' : 'error'](++calls, msg, data);
  };
}(0));

// Generates an assertion
function test(code, expected, expectedScore) {
  var res = score(expected / 2, code, expected);
  return assert(
    res === expectedScore,
    code + " = " + expected + "? => " + expectedScore,
    res
  );
}

// TESTS

function targetfn(i) {
    return (i + 2) * 3;
}

function run() {
  generation = [];
  var i = generationSize;
  var mother = ranked[0].code;
  var fi = 1;
  var father = ranked[fi].code;
  while (father === mother) {
    fi += 1;
    father = ranked[fi].code;
  }
  while (i--) {
    generation.push(breed(mother, father));
  }
  ranked = rank(generation, targetfn);
  best = ranked[0];
  averageScore = (averageScore + best.score) / 2;

  console.log(generations.fws(20), best.code, best.score.fws(10), averageScore.fws(10));

  generations++;

  if (generations < MAX_GENERATIONS && best.score < 1) {
    setTimeout(run, 20);
  }
}

var MAX_GENERATIONS = 10000;
var generation = [];
var generationSize = 100;
var i = generationSize;
while (i--) {
   generation.push(generate(7));
}

var averageScore = 0;
var generations = 1;
var ranked = rank(generation, targetfn);
var best = ranked[0];
run();


// test('1+1', 2, 1)
// test('""+2', 2, 0.3)
