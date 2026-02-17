export function computeWPM(
  startingTime, currentTime, totalTypedLetters, errorCount
) {
  if (startingTime == currentTime) return 0
  const typingDuration = Math.abs(currentTime - startingTime) / 60;
  const wordCount = (totalTypedLetters - errorCount) / 5;
  return Math.round(wordCount / typingDuration);
}
export function computeAccuracy(totalTypedLetters, errorCount) {
  let acc = 100;
  if (totalTypedLetters) {
    acc = ((totalTypedLetters - errorCount) * 100) / totalTypedLetters;
    acc = (acc < 100 ? acc.toFixed(2) : acc);
  }
  return acc
}