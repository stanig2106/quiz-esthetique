import type { Question } from "@/types";

export const shuffleArray = <T>(items: T[]) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const shuffleQuestions = (questions: Question[]) => {
  const shuffledQuestions = shuffleArray(questions).map((question) => {
    const indexedChoices = question.choices.map((choice, index) => ({
      choice,
      index,
    }));
    const shuffledChoices = shuffleArray(indexedChoices);
    const newCorrectIndex = shuffledChoices.findIndex(
      (item) => item.index === question.correctIndex
    );
    return {
      ...question,
      choices: shuffledChoices.map((item) => item.choice),
      correctIndex: newCorrectIndex,
    };
  });
  return shuffledQuestions;
};
