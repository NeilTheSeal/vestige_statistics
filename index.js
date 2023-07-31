let total_kc = 0; // The total number of kills by all players combined
const number_of_players = 1000000; // Sample size
const kc_array = []; // An array where each element is the number of kills it took for a player to get the vestige
const rarity = 1 / 1000; // Combined "rarity" of the vestige drop
const rolls_required = 3; // Number of "successes" required to get the vestige drop

// First, we calculate how many kc it took to get the vestige for 1,000,000 players
for(let i = 0; i < number_of_players; i++) {
  let kc = 0;
  let successes = 0;
  while(successes < rolls_required) {
    let chance = rarity * rolls_required;
    if(Math.random() <= chance) {
      successes++
    }
    kc++;
    total_kc++;
  }
  kc_array.push(kc)
}

// Mean drop rate of vestige
const mean = total_kc / number_of_players;

// Sort the kc_array from smallest to largest kc
kc_array.sort(function(a,b) {
  return a - b;
});

const bar_chart = [];

// Create a 2-dimensional array of the format [[kc, number of players], [kc, number of players], [kc, number of players] ...]. Note that the "number of players" is the number of players that got between the last element and next element. For example, the element [...[10, 393],...] would mean that 393 players took between 10 and 20 kc to get the drop. In this sense, it is like a bar chart. Hence the "bar_chart" variable
for(let kc = 0; kc < kc_array[kc_array.length - 1]; kc += 10) {
  let count = 0;
  for(let i = 0; i < kc_array.length; i++) {
    const num = kc_array[i];
    if(num >= kc && num < kc + 10) {
      count++
    }
  }
  bar_chart.push([kc + 10, count])
}

// Maximum x-value for the plot
const max_x = Math.ceil(kc_array[kc_array.length - 1] / 1000) * 1000;

// Calculate maximum y-value for the plot
let max_y = 0;
for(let i = 0; i < bar_chart.length; i++) {
  const y = bar_chart[i][1];
  if(y > max_y) {max_y = y}
}

const percent1 = 0.50;
const percent2 = 0.75;
const percent3 = 0.9;
const percent4 = 0.95;
const percent5 = 0.99;

let num1, num2, num3, num4, num5;

// Calculate the kill count required for a certain percentage of the players. E.g. 50% of players got the drop before 895 kc
let count = 0;
for(let i = 0; i < bar_chart.length; i++) {
  const bar = bar_chart[i];
  const x = bar[0];
  const y = bar[1];
  count += y;
  const percent = count / number_of_players;
  if(percent > percent1 && num1 == undefined) {
    num1 = x;
  }
  if(percent > percent2 && num2 == undefined) {
    num2 = x;
  }
  if(percent > percent3 && num3 == undefined) {
    num3 = x;
  }
  if(percent > percent4 && num4 == undefined) {
    num4 = x;
  }
  if(percent > percent5 && num5 == undefined) {
    num5 = x;
  }
}

console.log(`50% : ${num1}\n75% : ${num2}\n90% : ${num3}\n95% : ${num4}\n99% : ${num5}`);

// Everything from here down is code to draw the plot using the P5.js library. https://p5js.org/
function setup() {
  createCanvas(1000, 700);
  background(250);
  noLoop();
}

function coordToPix(x, y) {
  const margin = [[60, 50], [80, 80]];
  const x_pix = margin[0][0] + (width - margin[0][0] - margin[0][1]) * (x / max_x);
  const y_pix = height - margin[1][1] - (height - margin[1][0] - margin[1][1]) * (y / max_y);
  return [x_pix, y_pix]
}

function draw() {
  const bottom_left = coordToPix(0, 0);
  const top_left = coordToPix(0, max_y);
  const bottom_right = coordToPix(max_x, 0);
  stroke(0);
  strokeWeight(1);
  noFill();
  line(bottom_left[0], bottom_left[1], top_left[0], top_left[1]);
  line(bottom_left[0], bottom_left[1], bottom_right[0], bottom_right[1]);
  for(let x = 0; x <= max_x; x += 200) {
    x = Math.round(x / 100) * 100;
    const major = x % 1000 == 0 ? true : false;
    const tickLength = major ? 8 : 4;
    const coord = coordToPix(x, 0);
    if(x > 0) {
      if(major) { stroke(220) } else { stroke(235) }
      noFill();
      line(coord[0], coord[1], coord[0], top_left[1]);
    }
    stroke(0);
    line(coord[0], coord[1], coord[0], coord[1] - tickLength);
    noStroke();
    fill(0);
    textSize(15);
    textAlign(CENTER, TOP);
    if(major) {
      text(`${Math.round(x)}`, coord[0], coord[1] + 8);
    }
    textSize(20);
    text("Number of players that got a vestige vs. kill count\n(based on a drop rate of 1/1000)", width / 2, 20);
    text("kill count", width / 2, height - 40);
    push();
    translate(20, height / 2);
    rotate(-1 * Math.PI / 2);
    text("Number of players", 0, 0);
    pop();
  }
  for(let i = 0; i <= 40; i++) {
    i = Math.round(i);
    const y = (i / 40) * max_y;
    const major = i % 5 == 0 ? true : false;
    const tickLength = major ? 8 : 4;
    const coord = coordToPix(0, y);
    if(y > 0) {
      if(major) { stroke(220) } else { stroke(235) }
      noFill();
      line(coord[0], coord[1], bottom_right[0], coord[1]);
    }
    stroke(0);
    line(coord[0], coord[1], coord[0] + tickLength, coord[1]);
  }
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(bottom_left[0], bottom_left[1]);
  for(let i = 0; i < bar_chart.length; i++) {
    const bar = bar_chart[i];
    const x = bar[0];
    const y = bar[1];
    const coords = coordToPix(x, y);
    vertex(coords[0], coords[1]);
  }
  vertex(bottom_right[0], bottom_right[1]);
  endShape();
}