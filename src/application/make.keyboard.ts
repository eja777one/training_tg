export const makeKeyboard = (object: any): string => {
  const keys = [];
  for (const [key, value] of Object.entries(object)) {
    const temp = { text: key, callback_data: value };
    keys.push(temp);
  }
  return JSON.stringify({ inline_keyboard: [keys] });
};

// const keyboard = JSON.stringify({
//   inline_keyboard: [[
//     { text: "Показать следующую тренировку", callback_data: "/nextTrainingDate" }
//   ]]
// });