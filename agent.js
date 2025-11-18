import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { TavilyClient } from "tavily"
import dotenv from "dotenv"
import { END, Graph, MemorySaver } from "@langchain/langgraph"
import e from "express"
dotenv.config()


const modelGemini = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
     model:"gemini-2.5-flash-lite"
    })
      
const memory = new MemorySaver()

const tavily = new TavilyClient({
      apiKey:process.env.TAVILY_API_KEY,
})



async function researchAgent(state){
      const topic = state.topic

      let summaryPrompt = ""
      // determine if the topic is for research purpose

      const determineRequirement = `
Your task is to analyze the following topic: "${topic}".
Determine whether this topic is intended for academic or research purposes.

If the topic is suitable for research or academic writing (e.g., a project, paper, or report), return only: true  
If it is casual, conversational, or unrelated to academic research, return only: false

Do not include any explanation — just return the boolean value (true or false).
`;

      const requirementRes = await modelGemini.invoke(determineRequirement)





       if(requirementRes.content.toLowerCase().includes("true")){
      const res = await tavily.search(topic)
      

      const summary = res.results.map((r) => (r.content)).join("\n")

       
      
       
      summaryPrompt = `Summarize these search results into a clear academic insights, also keep track of links for reference "${summary}". ensure the retured valued can be used by other agents`
      
      } 

      else {
            summaryPrompt = `the topic is "${topic}", but it's not for research purpose, so return a brief explanation about the topic, ensure the retured valued can be used by other agents`
      }
      const summaryRes = await modelGemini.invoke(summaryPrompt)


      return {topic,research:summaryRes}

}

async function writerAgent(state) {
      const {topic, research} = state


     const writingprompt = `
You are an intelligent academic writing assistant helping students write final-year projects. 
However, if the user input is a casual or non-academic message (like greetings, jokes, or general conversation),
respond briefly and politely, without generating any academic-style content.

Otherwise, using the provided research data carefully, write an academic-style section for the topic "${topic}".

Research data: "${research.content}"
and The entered topic is "${topic}"
Guidelines:
- Be formal, structured, and factual if the data supports academic writing.
- If the data seems non-academic, summarize clearly but stay neutral and professional.
- Use a natural, human-like writing style — avoid robotic phrasing.
- Do NOT hallucinate or make up facts.
- Keep track of all references or source links when available.
- If the topic or data is unrelated to academics (like greetings, casual chat, etc.), just reply briefly and friendly — e.g., "Hello! How can I help you with your academic work today?"
- The research data may be incomplete; only use supported information.
- You are helping students write final-year school projects, so accuracy and credibility are crucial.
`;

      const output = await modelGemini.invoke(writingprompt)
      return {output}
}

const graph = new Graph()
graph.addNode("research", researchAgent)
graph.addNode("writer", writerAgent)


graph.setEntryPoint("research")
graph.addEdge("research", "writer")
graph.addEdge("writer", END)

export const aiApp = graph.compile({memory})



/*const res = await app.invoke({
      topic: "impact of technology on modern education",

      
})*/



