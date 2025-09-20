import { GoogleGenAI, Type } from "@google/genai";
import { DFMAnalysisResult, ProductionQuote } from '@/types';

// FIX: Per @google/genai coding guidelines, the API key must be obtained exclusively from process.env.API_KEY.
const API_KEY = process.env.API_KEY;

// FIX: To prevent runtime errors, the GoogleGenAI client is initialized only if the API key is present.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  // FIX: Updated the warning message to reflect the use of process.env.API_KEY.
  console.warn("Gemini API anahtarı API_KEY olarak ortam değişkenlerinde bulunamadı. AI özellikleri çalışmayacak.");
}

export const summarizeText = async (text: string): Promise<string> => {
  // FIX: The check now verifies if the 'ai' client was successfully initialized.
  if (!ai) {
    return "API anahtarı yapılandırılmadığı için özetleme yapılamadı.";
  }
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Aşağıdaki görüşme notlarını analiz et ve en önemli noktaları madde madde, kısa ve anlaşılır bir şekilde özetle:\n\n---\n${text}\n---\n\nÖZET:`;
    
    const response = await ai.models.generateContent({
        model,
        // FIX: Per @google/genai guidelines, for a simple text prompt, 'contents' should be a string.
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful assistant specialized in summarizing business meeting notes for a CRM application.",
        }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Metin özetlenirken bir hata oluştu.";
  }
};


export const analyze3DModelForManufacturability = async (): Promise<DFMAnalysisResult[]> => {
    // This is a simulated function. In a real application, you would pass model data.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { issue: 'İnce Duvar Kalınlığı', severity: 'Yüksek', suggestion: 'Parçanın sol alt bölgesindeki duvar kalınlığını en az 1.5mm\'ye çıkarın.' },
                { issue: 'Ters Açı Problemi', severity: 'Orta', suggestion: 'Modelin iç kısmındaki açıyı kalıptan çıkacak şekilde 3 dereceye ayarlayın.' },
            ]);
        }, 1000);
    });
};


export const generateProductionQuoteFromAnalysis = async (): Promise<ProductionQuote> => {
    if (!ai) {
        throw new Error("AI client not initialized.");
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Simüle edilmiş bir 3D metal parça için DFM, maliyet ve takım analizi yap.",
            config: {
                systemInstruction: "You are a manufacturing expert AI. Analyze the provided (simulated) 3D model data to generate a detailed Design for Manufacturability (DFM) report, a list of required CNC tools with image URLs, and a production cost breakdown. Provide your response in the structured JSON format defined in the schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dfmIssues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    issue: { type: Type.STRING },
                                    severity: { type: Type.STRING, enum: ['Yüksek', 'Orta', 'Düşük'] },
                                    suggestion: { type: Type.STRING }
                                }
                            }
                        },
                        tools: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    purpose: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING, description: "URL to a representative image of the tool." }
                                }
                            }
                        },
                        steps: {
                             type: Type.ARRAY,
                             items: {
                                 type: Type.OBJECT,
                                 properties: {
                                     description: { type: Type.STRING },
                                     estimatedTime: { type: Type.STRING },
                                     cost: { type: Type.NUMBER }
                                 }
                             }
                        },
                        totalCost: { type: Type.NUMBER }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating production quote:", error);
        // Return a fallback quote on error
        return {
            dfmIssues: [{ issue: 'AI Analizi Başarısız', severity: 'Yüksek', suggestion: 'Yapay zeka servisinden geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.' }],
            tools: [],
            steps: [{ description: 'Hata', estimatedTime: '0 dk', cost: 0 }],
            totalCost: 0
        };
    }
};