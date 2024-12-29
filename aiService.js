const { MistralAI } = require("@langchain/mistralai");
const { PromptTemplate } = require("@langchain/core/prompts")

const llm = new MistralAI({
  model: "codestral-latest",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: "W9a1Hhhf82eyf8aswpNuKryG4ssPKRYx",
  // other params...
});

const prompt = PromptTemplate.fromTemplate(
  "Extract the {targetLanguage} from this text: {input}\n"
);

const chain = prompt.pipe(llm)

async function getQuickReplies(message) {
  try {
    console.log('Running getQuickReplies with: ' + message)
    const inputText = 
    
    `Generate 3 conversational quick replies for the following message (1-3 word replies): 
    "${message}"`;
    const completion = await llm.invoke(inputText);

    console.log('Ran getQuickReplies with: ' + completion.split("\n").filter((reply) => reply.trim()))
    const cleanedReplies = completion.split("\n").map(reply => reply.replace(/\d+\.\s*"(.*?)"/g, '$1').trim()).filter(reply => reply);
    return cleanedReplies;

    // const completion2 = await chain.invoke({
    //   output_language: "German",
    //   input: "I love programming.",
    // });

    // console.log(completion2)
  } catch (error) {
    console.error("Error invoking MistralAI:", error);
    return null; // Return null to allow fallback to rule-based suggestions
  }
}

async function translateText(text, targetLanguage) {  
  try{
    const inputText = `Translate the following text in English to ${targetLanguage} and provide the translation in the format "Translation: <translated_text>": "${text}"`;
    const completion = await llm.invoke(inputText);
    console.log(targetLanguage)

    // const completion2 = await chain.invoke({
    //   targetLanguage: targetLanguage,
    //   input: completion,
    // });

    // Parse the output to extract the translated text, ignoring text after the end quote or newline
    const parsedOutput = completion.match(/Translation:\s*["']?(.*?)(["']|\n|$)/i);
    const translatedText = parsedOutput ? parsedOutput[1] : completion;

    return translatedText;
  } catch (error) {
    console.error("Error invoking MistralAI:", error);
    return null; // Return null to allow fallback to rule-based suggestions
  }

}

async function generateEmoji(text) {
  try {
    const inputText = `Analyze the following text and provide a suitable emoji as a reply: "${text}"`;
    const completion = await llm.invoke(inputText);
    const emoji = completion.trim().match(/[\p{Emoji_Presentation}\p{Emoji}\u200d]+/gu)[0];
    console.log(emoji)
    return emoji;
  } catch (error) {
    console.error("Error invoking MistralAI for emoji generation:", error);
    return null;
  }
}

generateEmoji("I am happy");

module.exports = { getQuickReplies, translateText, generateEmoji };


// (async () => {
//   const testMessage = "What is calculus?";
//   const replies = await getQuickReplies(testMessage);

//   console.log("Generated Quick Replies:", replies);
// })();
  



// const inputText = "MistralAI is an AI company that ";

// const completion = await llm.invoke(inputText);
// completion;