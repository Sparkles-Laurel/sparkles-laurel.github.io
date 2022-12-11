/*
shuffle.js -shuffle answers in a given test.
*/

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  let answerSets = document.querySelectorAll("li.question-answer");
  let newOrder = shuffle(answerSets);
  answerSets.zip = (l) => answerSets.map((e, i) => [e, l[i]])
  answerSets.zip(newOrder);