function getOffBoat(total = 30, remain = 15, step = 9) {
  const people = Array.from({ length: total }, (_, i) => i + 1);
  const offBoat = [];
  let index = 0;

  while (people.length > remain) {
    index = (index + step - 1) % people.length;
    offBoat.push(people.splice(index, 1)[0]);
  }

  return {
    offBoat,
    leftOnBoat: people,
  };
}

const result = getOffBoat();
console.log("下船编号:", result.offBoat.join(", "));
console.log("留在船上编号:", result.leftOnBoat.join(", "));

module.exports = { getOffBoat };
