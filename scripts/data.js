// Fetch data
export async function fetchPassageData() {
  const response = await fetch("https://raw.githubusercontent.com/somaia02/typing-test/master/data.json");
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const passageData = await response.json();
  return passageData;
}