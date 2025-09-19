import { api } from './apiService';
import { Customer } from '@/types';

export async function listCustomers(): Promise<Customer[]> {
    // In a real app this would fetch from the backend.
    // For now, we simulate this with a delay.
    console.log("Simulating API call to list customers");
    await new Promise(res => setTimeout(res, 300));
    // We return an empty array as the source of truth for customers is still Dexie in this app
    return [];
}

export async function createCustomer(payload: Omit<Customer, 'id'|'createdAt'|'synced'>): Promise<Customer> {
    // In a real app, this would be:
    // const { data } = await api.post('/customers', payload);
    // return data;
    console.log("Simulating API call to create customer", payload);
    await new Promise(res => setTimeout(res, 300));
    return {
        ...payload,
        id: `new-cust-${Math.random()}`,
        createdAt: new Date().toISOString(),
        synced: true,
    };
}
