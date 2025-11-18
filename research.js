import {createReactAgent} from "@langchain/langgraph/prebuilt"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { TavilyClient } from "tavily"
import dotenv from "dotenv"
import { END, Graph, MemorySaver } from "@langchain/langgraph"
import {tool} from "@langchain/core/tools"
import fetch from "node-fetch"
import { z } from "zod"
dotenv.config()


const systemPrompt = `
You are "Brainseek created By netech (newton oyagha)", an academic research AI assistant built to help students
write research papers, dissertations, and final year projects.

### 🎓 Your Role and Behavior:
- You write clear, humanized, and academic-quality text that sounds natural.
- Always use the **web_search tool** or any factual data source before giving any claim, fact, or definition.
- Every factual statement must include a **proper citation** (APA, MLA, or Harvard style but APA is default) and a **reference list** if sources are available.
- You **never hallucinate** or invent data, references, or authors.
- If data cannot be verified, clearly say: *“I couldn’t verify this information from reliable sources.”*
- Avoid robotic or overly formal academic language — write like a human who understands research.
- Be concise but insightful; focus on **clarity, accuracy, and logical structure.**

### 🧩 Tools:
- Always check the "web_search" tool for real data or references before writing.
- Use the "wolframAlpha" tool for advanced scientific, engineering, or mathematical queries that you can't easily solve, and always return the step-by-step procedure in solving.
- Use the "javascript" tool to execute advanced engineering, mathematical, data simulations or call external api in Node.js; always produce safe, valid JS code, avoid hallucination, and return clear, human-readable results with explanations.
- Use other tools (like summarize, analyze, or format) as needed to produce high-quality academic output.

### 📜 Output Format:
- Maintain proper academic structure (Introduction, Body, Conclusion when needed).
- Include **citations** (in-text) and a **References** section at the end when sources are available.
- Ensure grammar, coherence, and tone are at a professional academic level.
`;



const modelGemini = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
     model:"gemini-2.5-flash-lite",
     streaming:true
     
    })
      
const memory = new MemorySaver()

const tavily = new TavilyClient({
      apiKey:process.env.TAVILY_API_KEY,
})




const searchTool = tool(
      async ({query}) => {
            return await tavily.search(query)
      },
      {
            name: "tavilySearch",
            description: "useful for when you need to find information about current events or topics. input should be a search query",
            schema:z.object({
                  query: z.string().describe("the search query to find information about")
            })

      }
)

const wolframTool = tool(
      async ({input})=>{
            const appid = process.env.WOLFRAM_ID
            if(!appid){
                  throw new Error("Wolfram Alpha API key not set in environment variables")
            }


            const query = encodeURIComponent(input.trim());
            const url = `https://api.wolframalpha.com/v2/query?input=${query}&appid=${appid}&output=json`;
            const res = await fetch(url)
            const data = await res.json()
            if (!data.queryresult || !data.queryresult.success) {
            return "No valid Wolfram Alpha result found.";
                   }



      const pods = data.queryresult.pods
      .map((p) => `**${p.title}:** ${p.subpods.map((sp) => sp.plaintext).join(" ")}`)
      .join("\n\n");

                  return pods || "no plaintext result found.";
      },
      {
            name:"wolframAlpha",
            description: `
                  Use this tool for factual scientific, engineering, and mathematical computations.
                  Always use this when the query involves formulas, equations, or numerical data.
                  Input should be a plain English or symbolic math expression.
                  Output is factual, verified information with references.`,
            schema:z.object({
                  input: z.string().describe("the specific question or query to get an answer for")
            })
      }

)



async function evalCaptureOutput(code) {
      const oldLog = console.log;
      const oldError = console.error;

      let output = [];
      let errorOutput = [];

      console.log = (...args)=> output.push(args.join(" "));
      console.error = (...args)=> errorOutput.push(args.join(" "));


      try {
            await eval(code)
      } catch (error) {
            errorOutput.push(error.message)
      }
      console.log = oldLog;
      console.error = oldError;

      return {stdout: output.join("\n"), stderr: errorOutput.join("\n")};


}



const jsExecutor = tool(
      async ({code}) => {
            const result = await evalCaptureOutput(code)

            return `Result: ${result}`

            
      },
      {
            name: "jsExecutor",
          description: `Execute advanced JavaScript code for engineering simulations, numerical computations, algorithmic modeling, or data analysis.
This tool runs inside a secure Node.js evaluation environment.
Use it whenever complex logic, iterative computation, data transformation, or simulation is required.

The implementation must:

Run valid, safe JavaScript compatible with Node.js.

Support dynamic logic, loops, conditionals, numerical methods, and real-time calculations.

Always return stdout and stderr, plus a clear, structured, human-readable explanation of the results.

Avoid hallucinations — rely only on provided inputs, defined variables, or externally fetched data.

🔗 API Access & Tool-Chaining Behavior

If a task requires external or real-time information (e.g., engineering constants, environmental data, sensor values, database entries, stock data, weather, or any missing parameters), the agent should:

Automatically call the appropriate API tool first,

Retrieve and validate the required data,

Inject the fetched data into the JavaScript code,

Run the computation,

Return combined interpreted results.

This tool supports tool-chaining, meaning the agent may call multiple tools in sequence to gather inputs before execution.

Use this tool whenever JavaScript execution is essential for the final or intermediate step in reasoning`,

            schema: z.object({
                  code: z.string().describe("The JavaScript code to execute.")
            })
      }
)


export const agent = await createReactAgent({
      llm: modelGemini,
      tools: [searchTool, wolframTool, jsExecutor],
      prompt: systemPrompt,
      
      checkpointSaver: memory,
     
})

