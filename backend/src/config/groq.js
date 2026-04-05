import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateQuestion(jobRole, difficulty, interviewType, questionType, selectedStacks, previousQuestions = []) {
  const prev = previousQuestions.length > 0
    ? previousQuestions.join('; ')
    : 'None';

  const stacks = selectedStacks || jobRole;

  let typeInstruction = '';
  if (questionType === 'theoretical') {
    typeInstruction = 'Ask a THEORETICAL/CONCEPTUAL question — definitions, how things work internally, comparisons, trade-offs, design principles, "explain" or "what is" style.';
  } else if (questionType === 'practical') {
    typeInstruction = 'Ask a PRACTICAL/CODING question — write code, debug, implement, solve a real-world problem, write a function, fix a bug, system design with implementation details.';
  } else {
    typeInstruction = 'Alternate between theoretical and practical questions. If previous questions were more theoretical, ask a practical one and vice versa.';
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'system',
      content: `You are a senior technical interviewer at a top tech company (Google/Meta/Amazon level). You ask real-world, commonly asked interview questions that candidates actually face in ${difficulty}-level interviews. Focus on questions that are popular on platforms like LeetCode discussions, Glassdoor, Blind, and actual interview prep resources for 2024-2025.`
    }, {
      role: 'user',
      content: `Generate 1 interview question for a ${jobRole} position.
Difficulty: ${difficulty}
Interview type: ${interviewType}
Technologies/Stack: ${stacks}

${typeInstruction}

IMPORTANT RULES:
- Ask questions that are ACTUALLY asked in real interviews at top companies
- Focus on the specific technologies listed: ${stacks}
- Make it specific and detailed, not vague or generic
- For ${difficulty} level, calibrate complexity appropriately
- Do NOT repeat or rephrase any of these previously asked questions: ${prev}

Return ONLY the question text, nothing else. No numbering, no prefix, no "Question:" label.`
    }],
    temperature: 0.85,
    max_tokens: 400
  });

  return response.choices[0].message.content.trim();
}

export async function evaluateAnswer(question, answer, jobRole, difficulty, selectedStacks) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'system',
      content: 'You are a strict but fair senior technical interviewer. Evaluate answers based on real industry standards. Be specific in your feedback.'
    }, {
      role: 'user',
      content: `Evaluate this interview answer.
Question: ${question}
Candidate Answer: ${answer}
Job Role: ${jobRole}
Difficulty: ${difficulty}
Technologies: ${selectedStacks || jobRole}

Scoring guide:
- 9-10: Perfect or near-perfect, covers edge cases, shows deep understanding
- 7-8: Good answer with minor gaps, demonstrates solid knowledge
- 5-6: Acceptable but missing key points or depth
- 3-4: Below expectations, significant gaps
- 1-2: Very poor, mostly incorrect or irrelevant

Return ONLY a JSON object (no markdown, no code blocks):
{
  "score": (1-10),
  "strength": "(what was good, 1-2 sentences)",
  "weakness": "(what was missing or could be improved, 1-2 sentences)",
  "better_answer": "(ideal answer in 3-4 sentences)"
}`
    }],
    temperature: 0.3,
    max_tokens: 600
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}
