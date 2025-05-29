import { AccountsClient, LecturesClient, ProjectsClient } from "../web-api-client.ts"

// Initialize API clients
export const accountsClient = new AccountsClient()
export const lecturesClient = new LecturesClient()
export const projectsClient = new ProjectsClient()

// Simulated external vocabulary API
export const simulateVocabDefinition = async (word: string): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulated responses for common words
  const definitions: Record<string, string> = {
    algorithm: "A step-by-step procedure for solving a problem or accomplishing a task.",
    javascript:
      "A programming language that enables interactive web pages and is an essential part of web applications.",
    python: "A high-level, interpreted programming language known for its readability and versatility.",
    html: "HyperText Markup Language, the standard language for creating web pages.",
    css: "Cascading Style Sheets, a language used to describe the presentation of a document written in HTML.",
    programming: "The process of creating a set of instructions that tell a computer how to perform a task.",
    software: "Computer programs and related documentation that provide instructions for a computer.",
    database: "An organized collection of structured information, or data, typically stored electronically.",
    network: "A group of interconnected computers that can share resources and communicate with each other.",
    security: "The practice of protecting systems, networks, and programs from digital attacks.",
  }

  const lowerWord = word.toLowerCase()
  return definitions[lowerWord] || `A ${word} is a term used in computer science and technology.`
}
