import { prompt } from 'inquirer';
import * as reduce from 'lodash/reduce';
import * as sample from 'lodash/sample';

interface TransitionsCount {
  Rock: number;
  Paper: number;
  Scissors: number;
}

interface Transitions {
  Rock: TransitionsCount;
  Paper: TransitionsCount;
  Scissors: TransitionsCount;
}

interface Scores {
  wins: number;
  loses: number;
  ties: number;
}

enum Choices {
  Rock = 'Rock',
  Paper = 'Paper',
  Scissors = 'Scissors',
  Quit = 'Quit',
}
  
const transitions: Transitions = {
  Rock: {
    Rock: 0,
    Scissors: 0,
    Paper: 0,
  },
  Paper: {
    Rock: 0,
    Scissors: 0,
    Paper: 0,
  },
  Scissors: {
    Rock: 0,
    Scissors: 0,
    Paper: 0,
  },
};

const scores: Scores = {
  wins: 0,
  loses: 0,
  ties: 0
};

const beatingHands = {
  Rock: 'Paper',
  Paper: 'Scissors',
  Scissors: 'Rock'
};

function getBeatingHands(plays: string[]) {
  return plays.map(play => beatingHands[play]);
}

function getComputerChoice(previousChoice: Choices, transitions: Transitions): Choices {
  if (previousChoice) {
    const possiblePlays = reduce(transitions[previousChoice], (result: Choices[], current: number, key: Choices) => {
      if (result.length === 0) {
        result.push(key);
      } else if (current > transitions[previousChoice][result[0]]) {
        result = [key];
      } else if (current === transitions[previousChoice][result[0]]) {
        result.push(key);
      }

      return result;
    }, []);

    // return sample(['Rock', 'Paper', 'Scissors']);
    return sample(getBeatingHands(possiblePlays));
  }

  return sample(['Rock', 'Paper', 'Scissors']);
}

function displayScores({loses, ties, wins}) {
  console.log('Scores: ');
  console.log('Wins: ', wins);
  console.log('Loses: ', loses);
  console.log('Ties: ', ties);
}

function updateTransitionsMatrix(transitions: Transitions, previousChoice: Choices, choice: Choices) {
  if (previousChoice) {
    ++transitions[previousChoice][choice];
  }
}

(async (transitions: Transitions, scores: Scores) => {
  let previousChoice: Choices = null;
  let computerChoice: Choices = null;
  const choices: ReadonlyArray<string> = ['Rock', 'Paper', 'Scissors', 'Quit'];

  while (previousChoice !== Choices.Quit) {
    try {
      computerChoice = getComputerChoice(previousChoice, transitions);

      const {choice} = await prompt<{ choice: Choices }>({
        type: 'list',
        name: 'choice',
        message: 'What do you play?',
        choices
      });

      if (choice !== Choices.Quit) {
        console.log('The computer plays:', computerChoice);

        if (beatingHands[computerChoice] === choice) {
          ++scores.wins;
          console.log('You win!');
        } else if (beatingHands[choice] === computerChoice) {
          ++scores.loses;
          console.log('You lose!');
        } else {
          ++scores.ties;
          console.log('It\'s a tie!');
        }
      } else {
        console.log('-------------');
        console.log('Game is over!');
      }

      displayScores(scores);

      updateTransitionsMatrix(transitions, previousChoice, choice);
      previousChoice = choice;
    } catch (error) {
      console.log('Error:', error);
    }
  }
})(transitions, scores);
