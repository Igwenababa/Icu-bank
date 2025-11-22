
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NewsArticle, InsuranceProduct, LoanProduct, SystemUpdate, AccountType, VerificationLevel, AdvisorResponse, Cause } from '../types.ts';

let ai: GoogleGenAI | undefined;

// Safe access to process.env.API_KEY
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

// Helper for exponential backoff retry
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export interface TranslationResult {
  translatedText: string;
  isError: boolean;
}

export const translateWithGemini = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
    if (!ai) {
        return { translatedText: `(AI offline) ${text}`, isError: true };
    }
     if (!text || !text.trim()) {
        return { translatedText: "", isError: false };
    }
    
    try {
        const response = await retryOperation<GenerateContentResponse>(() => ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}. Return only the translated text, without any additional formatting or explanations. Text to translate: "${text}"`,
        }));
        return { translatedText: response.text?.trim() ?? '', isError: false };
    } catch (error) {
        console.warn(`Error translating text to ${targetLanguage}:`, error);
        return { translatedText: `(Translation Error) ${text}`, isError: true };
    }
};

export interface BankingTipResult {
  tip: string;
  isError: boolean;
}

const tipCache = new Map<string, BankingTipResult>();

export const getCountryBankingTip = async (countryName: string): Promise<BankingTipResult> => {
  if (tipCache.has(countryName)) {
    return tipCache.get(countryName)!;
  }

  if (!ai) {
    const result: BankingTipResult = {
      tip: `Standard banking information is required for ${countryName}.`,
      isError: false,
    };
    tipCache.set(countryName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, concise, and helpful banking tip for a user sending money to a bank account in ${countryName}. The tip should focus on a specific local requirement, a common mistake to avoid, or a best practice for that country. Output JSON.`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: `A short, one-sentence banking tip for sending money to ${countryName}.`
            }
          }
        }
      }
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { tip: string };
    const result: BankingTipResult = { tip: parsedJson.tip, isError: false };
    tipCache.set(countryName, result);
    return result;
  } catch (error) {
    console.warn("Error fetching banking tip from Gemini:", error);
    const errorResult: BankingTipResult = { 
        tip: `Ensure you have the correct IBAN/Account Number for ${countryName}.`, 
        isError: true 
    };
    tipCache.set(countryName, errorResult);
    return errorResult;
  }
};

export interface FinancialNewsResult {
  articles: NewsArticle[];
  isError: boolean;
}

const newsCache = new Map<string, FinancialNewsResult>();
const newsCacheKey = 'financialNews';

export const getFinancialNews = async (): Promise<FinancialNewsResult> => {
  if (newsCache.has(newsCacheKey)) {
    return newsCache.get(newsCacheKey)!;
  }

  if (!ai) {
    const result = {
      articles: [
        { title: 'Global Markets Show Resilience', summary: 'Major indices are stabilizing as investors digest recent economic data.', category: 'Market Analysis' },
        { title: 'Fintech Innovation Peaks', summary: 'New technologies are streamlining cross-border payments faster than ever.', category: 'Technology' },
        { title: 'Currency Trends to Watch', summary: 'Analysts predict minor fluctuations in major currency pairs this week.', category: 'Forex' },
      ],
      isError: false,
    };
    newsCache.set(newsCacheKey, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 brief, synthetic financial news headlines and summaries relevant to international finance. Output JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                articles: {
                    type: Type.ARRAY,
                    description: "A list of three financial news articles.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            category: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { articles: NewsArticle[] };
    const articles = parsedJson.articles;
    const result = { articles, isError: false };
    newsCache.set(newsCacheKey, result);
    return result;

  } catch (error) {
    console.warn("Error fetching financial news from Gemini:", error);
    const errorResult = {
        articles: [ 
            { title: 'Market Update Unavailable', summary: 'We are currently unable to fetch the latest live market news.', category: 'System Alert' },
            { title: 'Trading Continues Normally', summary: 'All platform trading and transfer functions are fully operational.', category: 'Status' },
            { title: 'Check Back Soon', summary: 'Our financial news feed will be restored shortly.', category: 'Update' }
        ],
        isError: true,
    };
    newsCache.set(newsCacheKey, errorResult);
    return errorResult;
  }
};


const insuranceCache = new Map<string, { product: InsuranceProduct | null; isError: boolean }>();

export const getInsuranceProductDetails = async (productName: string): Promise<{ product: InsuranceProduct | null; isError: boolean; }> => {
  if (insuranceCache.has(productName)) {
    return insuranceCache.get(productName)!;
  }

  if (!ai) {
    // Return a mock product immediately if AI is offline or fails
    const mockDescription = `Comprehensive coverage for ${productName.toLowerCase()}.`;
    const mockBenefits = ["Full protection", "24/7 Support", "Easy claims"];
    const product: InsuranceProduct = { name: productName, description: mockDescription, benefits: mockBenefits };
    const result = { product, isError: true }; 
    insuranceCache.set(productName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a compelling marketing description and exactly 3 key benefits for a financial insurance product called "${productName}" offered by a fintech, iCredit Union®. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { description: string, benefits: string[] };
    const product: InsuranceProduct = { name: productName, description: parsedJson.description, benefits: parsedJson.benefits };
    const result = { product, isError: false };
    insuranceCache.set(productName, result);
    return result;
  } catch (error) {
    console.warn(`Error fetching insurance details for ${productName} from Gemini:`, error);
    const mockDescription = `Comprehensive coverage for ${productName.toLowerCase()}.`;
    const mockBenefits = ["Full protection", "24/7 Support", "Easy claims"];
    const product: InsuranceProduct = { name: productName, description: mockDescription, benefits: mockBenefits };
    const errorResult = { product, isError: true };
    insuranceCache.set(productName, errorResult);
    return errorResult;
  }
};

export const getFinancialAnalysis = async (financialDataJSON: string): Promise<{ analysis: AdvisorResponse | null, isError: boolean }> => {
  if (!ai) {
    return { analysis: null, isError: true };
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following financial data for a user and provide an overall summary, a financial score (0-100), a list of insights, and product recommendations. Data: ${financialDataJSON}. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING },
            financialScore: { type: Type.INTEGER },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productType: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                  linkTo: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as AdvisorResponse;
    return { analysis: parsedJson, isError: false };
  } catch (error) {
    console.warn("Error fetching financial analysis from Gemini:", error);
    return { analysis: null, isError: true };
  }
};

export const getLoanProducts = async (): Promise<{ products: LoanProduct[], isError: boolean }> => {
  const fallbackProducts: LoanProduct[] = [
      { id: 'loan1', name: 'Personal Loan', description: 'Flexible financing for life\'s big moments.', benefits: ['Fixed rates', 'No origination fees', 'Quick funding'], interestRate: { min: 7.99, max: 19.99 } },
      { id: 'loan2', name: 'Auto Loan', description: 'Competitive rates for new and used vehicles.', benefits: ['Flexible terms up to 72 months', 'Pre-approval available', 'Easy online application'], interestRate: { min: 5.49, max: 12.49 } },
      { id: 'loan3', name: 'Home Improvement Loan', description: 'Fund your next renovation project with a simple, fixed-rate loan.', benefits: ['Borrow up to $50,000', 'No home equity required', 'Fast decision process'], interestRate: { min: 6.99, max: 15.99 } },
  ];

  if (!ai) {
    return { products: fallbackProducts, isError: false };
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 synthetic and compelling loan products for a fintech called iCredit Union®. Include a unique id, name, description, 3 benefits, and min/max interest rates for each. Output JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique ID for the loan, e.g., loan1" },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  interestRate: {
                    type: Type.OBJECT,
                    properties: {
                      min: { type: Type.NUMBER },
                      max: { type: Type.NUMBER },
                    }
                  }
                }
              }
            }
          }
        }
      }
    }));

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { products: LoanProduct[] };
    return { products: parsedJson.products, isError: false };
  } catch (error) {
    console.warn("Error fetching loan products from Gemini:", error);
    return { products: fallbackProducts, isError: true };
  }
};

export const getSystemUpdates = async (): Promise<{ updates: SystemUpdate[], isError: boolean }> => {
  const fallback: SystemUpdate[] = [
      { id: 'upd1', title: 'Scheduled Maintenance', date: new Date().toISOString(), description: 'System will be briefly unavailable for scheduled upgrades.', category: 'Maintenance' },
      { id: 'upd2', title: 'New Feature: Virtual Cards', date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'You can now create virtual cards for secure online shopping.', category: 'New Feature' }
  ];

  if (!ai) {
    return { updates: fallback, isError: false };
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 recent, synthetic system updates for iCredit Union®. Include id, title, date (YYYY-MM-DD), description, and category ('New Feature', 'Improvement', 'Maintenance'). Output JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { updates: SystemUpdate[] };
    return { updates: parsedJson.updates, isError: false };
  } catch (error) {
    console.warn("Error fetching system updates from Gemini:", error);
    return { updates: fallback, isError: true };
  }
};

export const getSupportAnswer = async (query: string): Promise<{ answer: string, isError: boolean }> => {
  if (!ai) {
    return { answer: "Our AI assistant is currently offline. Please check back later.", isError: true };
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful support agent for iCredit Union®. Answer the following user query concisely and clearly. User query: "${query}"`,
      config: {
        temperature: 0.1,
      }
    }));
    
    const answer = response.text;
    if (!answer || answer.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    return { answer: answer.trim(), isError: false };
  } catch (error) {
    console.warn("Error fetching support answer from Gemini:", error);
    return { answer: "I'm sorry, I'm having trouble connecting to my knowledge base right now.", isError: true };
  }
};

export const getAccountPerks = async (accountType: AccountType, verificationLevel: VerificationLevel): Promise<{ perks: string[], isError: boolean }> => {
    if (!ai) {
        return { perks: ["Enhanced fraud monitoring.", "Priority customer support."], isError: false };
    }

    try {
        const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a list of exactly 2 compelling, synthetic "Advanced Security Perks" for a user with a "${accountType}" account and a verification level of "${verificationLevel}". Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        perks: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of exactly two security perk descriptions."
                        }
                    }
                }
            }
        }));

        const responseText = response.text;
        if (!responseText || responseText.trim() === '') {
            throw new Error('Received empty or invalid response from Gemini API.');
        }
        const parsedJson = JSON.parse(responseText.trim()) as { perks: string[] };
        return { perks: parsedJson.perks, isError: false };
    } catch (error) {
        console.warn("Error fetching account perks from Gemini:", error);
        return { perks: ["Enhanced fraud monitoring.", "Priority customer support."], isError: true };
    }
};

export const getCauseDetails = async (causeTitle: string): Promise<{ details: Cause['details'] | null; isError: boolean; }> => {
  if (!ai) {
    return { details: { description: 'Provides essential aid and relief to those in need, focusing on immediate impact.', impacts: ['$25 provides a family with clean water for a week.', '$100 supplies a classroom with essential learning materials.'] }, isError: false };
  }

  try {
    const response: GenerateContentResponse = await retryOperation(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For a charity cause titled "${causeTitle}", generate a slightly more detailed one-sentence description and a list of 2 specific, compelling impacts of a donation. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            impacts: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }));
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText.trim()) as { description: string; impacts: string[] };
    return { details: parsedJson, isError: false };
  } catch (error) {
    console.warn(`Error fetching cause details for ${causeTitle} from Gemini:`, error);
    return { details: { description: 'Your donation helps provide essential aid.', impacts: ['Provides immediate relief', 'Supports long-term recovery'] }, isError: true };
  }
};
