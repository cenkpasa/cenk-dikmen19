import axios, { AxiosInstance } from 'axios';

// Fix: Changed interface to a type intersection to correctly inherit AxiosInstance methods.
type CnkApi = AxiosInstance & {
    login(username: string, password: string): Promise<{ success: boolean; messageKey: string }>;
    sendPasswordResetCode(email: string): Promise<{ success: boolean; messageKey: string }>;
    verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; messageKey: string }>;
    generateText(prompt: string): Promise<string>;
    parseCard(base64Image: string): Promise<any>;
};

export const api = axios.create({
// Fix: Property 'env' does not exist on type 'ImportMeta'. Cast to any to bypass the type error.
    baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: false
}) as CnkApi;

// Fix: Add mock implementations for missing API methods.
api.login = async (username: string, password: string): Promise<{ success: boolean; messageKey: string }> => {
    console.log(`Simulating login for ${username}`);
    await new Promise(res => setTimeout(res, 300));
    // In a real app, the backend would validate credentials.
    // This mock simulates success for any user with the correct password format.
    // The AuthContext will then fetch the user details from the local DB.
    if (password) {
        return { success: true, messageKey: 'loggedInWelcome' };
    }
    return { success: false, messageKey: 'invalidPassword' };
};

api.sendPasswordResetCode = async (email: string): Promise<{ success: boolean; messageKey: string }> => {
    console.log(`Simulating password reset code for ${email}`);
    await new Promise(res => setTimeout(res, 300));
    return { success: true, messageKey: 'resetCodeSent' };
};

api.verifyPasswordResetCode = async (email: string, code: string): Promise<{ success: boolean; messageKey: string }> => {
    console.log(`Simulating code verification for ${email} with code ${code}`);
    await new Promise(res => setTimeout(res, 300));
    if (code) { // Simple check
        return { success: true, messageKey: 'codeVerified' };
    }
    return { success: false, messageKey: 'invalidCode' };
};

api.generateText = async (prompt: string): Promise<string> => {
    console.log(`Simulating AI text generation for prompt: ${prompt}`);
    await new Promise(res => setTimeout(res, 500));
    if (prompt.includes('takip e-postası')) {
        return `Sayın Yetkili,\n\nSize göndermiş olduğumuz teklifimizle ilgili olarak bir gelişme olup olmadığını öğrenmek istedik. Teklifimizi değerlendirme fırsatınız oldu mu?\n\nHerhangi bir sorunuz veya talebiniz olursa memnuniyetle yardımcı olmak isteriz.\n\nİyi çalışmalar dileriz.`;
    }
    return `This is a simulated AI response to the prompt: "${prompt.substring(0, 100)}..."`;
};

api.parseCard = async (base64Image: string): Promise<any> => {
    console.log('Simulating business card parsing');
    await new Promise(res => setTimeout(res, 1000));
    return {
        name: 'John Doe (Scanned)',
        company: 'Scanned Inc.',
        email: 'john.doe@scanned.com',
        phone: '123-456-7890',
        address: '123 Scan Street, Vision City',
    };
};

api.interceptors.request.use((cfg) => {
    // Use the existing app's auth storage
    const userJson = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user && user.id) {
                // Using a user property as a stand-in for a real token.
                // In a real app, this would be a JWT.
                // Fix: Modify header in place instead of reassigning to avoid type error with newer axios versions.
                cfg.headers.Authorization = `Bearer ${user.id}`;
            }
        } catch (e) {
            console.error("Failed to parse user from storage for API request", e);
        }
    }
    return cfg;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err.message || 'Bilinmeyen hata';
        return Promise.reject({ status, message: msg });
    }
);