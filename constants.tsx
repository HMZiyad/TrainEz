
import { Role, Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'host-1',
    title: 'The Impatient Walk-in',
    description: 'A customer arrives without a reservation during peak hour and is visibly upset about the wait.',
    role: Role.HOST,
    difficulty: 'Medium',
    customerProfile: 'An impatient diner named Mr. Henderson who thinks he should be seated immediately.',
    initialPrompt: "Hi, I've been standing here for 5 minutes. Why is nobody seating me? I can see empty tables over there!"
  },
  {
    id: 'server-1',
    title: 'The Allergy Mix-up',
    description: 'A guest receives a dish containing an ingredient they are allergic to, despite mentioning it earlier.',
    role: Role.SERVER,
    difficulty: 'Hard',
    customerProfile: 'A concerned parent whose child almost ate a nut-contaminated dish.',
    initialPrompt: "Wait! I explicitly told you my son has a severe nut allergy. This salad has walnuts in it! How could this happen?"
  },
  {
    id: 'server-2',
    title: 'Upselling the Special',
    description: 'Encourage a group of indecisive diners to try the premium chef special and a bottle of wine.',
    role: Role.SERVER,
    difficulty: 'Easy',
    customerProfile: 'A group of four friends celebrating a birthday, open to suggestions.',
    initialPrompt: "Everything looks so good, we just can't decide. What do you recommend for a special occasion?"
  },
  {
    id: 'manager-1',
    title: 'Staff Dispute',
    description: 'Two servers are arguing in the kitchen area where guests might hear them.',
    role: Role.MANAGER,
    difficulty: 'Hard',
    customerProfile: 'A fellow staff member who feels overwhelmed and unsupported.',
    initialPrompt: "I can't work with Sarah anymore! She keeps stealing my tables and the manager does nothing about it!"
  }
];

export const SYSTEM_PROMPT_TEMPLATE = (scenario: Scenario, language: string) => `
You are acting as a customer in a restaurant training simulation. 
Scenario: ${scenario.description}
Your Profile: ${scenario.customerProfile}
Staff Role Being Trained: ${scenario.role}
Language: ${language === 'es' ? 'Spanish' : 'English'}

Instructions:
1. Stay in character. Do not break character.
2. Respond naturally to the staff member's attempts to handle the situation.
3. Be challenging but realistic.
4. If they do a great job, become more appeased. If they are rude or unhelpful, become more upset.
5. Keep responses concise (under 3 sentences) to maintain a conversational flow.
`;
