import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Customer, User, LeaveRequest, Offer, MeetingForm, VehicleLog, Task, Expense, CustomerSegment, ProductionQuote } from '@/types';
import { initialCustomers, initialLeaveRequests, initialOffers, initialMeetingForms, initialVehicleLogs, initialTasks, initialExpenses } from '@/services/data.service';
import { useAuth } from './AuthContext';

interface DataContextType {
  customers: Customer[];
  personnel: User[];
  leaveRequests: LeaveRequest[];
  offers: Offer[];
  meetingForms: MeetingForm[];
  vehicleLogs: VehicleLog[];
  tasks: Task[];
  expenses: Expense[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'segment'>) => void;
  deleteCustomer: (customerId: string) => void;
  addLeaveRequest: (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => void;
  updateLeaveRequestStatus: (requestId: string, status: 'approved' | 'rejected') => void;
  addMeetingForm: (formData: Omit<MeetingForm, 'id' | 'createdAt' | 'aiSummary'>) => string;
  updateMeetingForm: (updatedForm: MeetingForm) => void;
  addVehicleLog: (logData: Omit<VehicleLog, 'id'>) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (updatedTask: Task) => void;
  addExpense: (expenseData: Omit<Expense, 'id'>) => void;
  addOffer: (offerData: { customerId: string; userId: string; details: ProductionQuote }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const segmentCustomer = (customer: Omit<Customer, 'segment'>): CustomerSegment => {
    const creationDate = new Date(customer.createdAt);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);

    if (customer.visitCount > 5 && daysSinceCreation < 180) return 'Sadık';
    if (customer.visitCount > 2) return 'Potansiyel';
    if (daysSinceCreation > 365 && customer.visitCount < 2) return 'Riskli';
    return 'Yeni';
};


export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { users: personnel } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [meetingForms, setMeetingForms] = useState<MeetingForm[]>([]);
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const loadData = <T,>(key: string, initialData: T[]): T[] => {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    };

    setCustomers(loadData('customers', initialCustomers));
    setLeaveRequests(loadData('leaveRequests', initialLeaveRequests));
    setOffers(loadData('offers', initialOffers));
    setMeetingForms(loadData('meetingForms', initialMeetingForms));
    setVehicleLogs(loadData('vehicleLogs', initialVehicleLogs));
    setTasks(loadData('tasks', initialTasks));
    setExpenses(loadData('expenses', initialExpenses));
  }, []);
  
  const segmentedCustomers = useMemo(() => {
      return customers.map(c => ({
          ...c,
          segment: segmentCustomer(c)
      }));
  }, [customers]);

  const saveData = <T,>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'segment'>) => {
    setCustomers(prev => {
      const rawNewCustomer = {
        ...customerData,
        id: `cust_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const newCustomer: Customer = {
          ...rawNewCustomer,
          segment: segmentCustomer(rawNewCustomer)
      }
      const updated = [...prev, newCustomer];
      saveData('customers', updated);
      return updated;
    });
  }, []);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== customerId);
      saveData('customers', updated);
      return updated;
    });
  }, []);

  const addLeaveRequest = useCallback((requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => {
    setLeaveRequests(prev => {
      const newRequest: LeaveRequest = {
        ...requestData,
        id: `leave_${Date.now()}`,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      const updated = [...prev, newRequest];
      saveData('leaveRequests', updated);
      return updated;
    });
  }, []);
  
  const updateLeaveRequestStatus = useCallback((requestId: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev => {
        const updated = prev.map(req => req.id === requestId ? { ...req, status } : req);
        saveData('leaveRequests', updated);
        return updated;
    });
  }, []);
  
  const addMeetingForm = useCallback((formData: Omit<MeetingForm, 'id' | 'createdAt' | 'aiSummary'>) : string => {
    const newId = `meet_${Date.now()}`;
    setMeetingForms(prev => {
      const newForm: MeetingForm = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
        aiSummary: ''
      };
      const updated = [...prev, newForm];
      saveData('meetingForms', updated);
      return updated;
    });
    return newId;
  }, []);

  const updateMeetingForm = useCallback((updatedForm: MeetingForm) => {
      setMeetingForms(prev => {
          const updated = prev.map(form => form.id === updatedForm.id ? updatedForm : form);
          saveData('meetingForms', updated);
          return updated;
      })
  }, [])

  const addVehicleLog = useCallback((logData: Omit<VehicleLog, 'id'>) => {
    setVehicleLogs(prev => {
        const newLog: VehicleLog = {
            ...logData,
            id: `log_${Date.now()}`,
        };
        const updated = [...prev, newLog];
        saveData('vehicleLogs', updated);
        return updated;
    });
  }, []);
  
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'status'>) => {
      setTasks(prev => {
          const newTask: Task = {
              ...taskData,
              id: `task_${Date.now()}`,
              status: 'pending'
          };
          const updated = [...prev, newTask];
          saveData('tasks', updated);
          return updated;
      });
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
      setTasks(prev => {
          const updated = prev.map(task => task.id === updatedTask.id ? updatedTask : task);
          saveData('tasks', updated);
          return updated;
      })
  }, []);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id'>) => {
      setExpenses(prev => {
          const newExpense: Expense = {
              ...expenseData,
              id: `exp_${Date.now()}`,
          };
          const updated = [...prev, newExpense];
          saveData('expenses', updated);
          return updated;
      });
  }, []);

  const addOffer = useCallback((offerData: { customerId: string; userId: string; details: ProductionQuote }) => {
    setOffers(prev => {
        const customer = customers.find(c => c.id === offerData.customerId);
        if (!customer) return prev;

        const newOffer: Offer = {
            id: `offer_${Date.now()}`,
            offerNo: `TEK-${new Date().getFullYear()}-${prev.length + 1}`,
            customerId: offerData.customerId,
            customerName: customer.name,
            userId: offerData.userId,
            date: new Date().toISOString(),
            totalAmount: offerData.details.totalCost,
            details: offerData.details,
        };
        const updated = [...prev, newOffer];
        saveData('offers', updated);
        return updated;
    });
}, [customers]);


  const value = { customers: segmentedCustomers, personnel, leaveRequests, offers, meetingForms, vehicleLogs, tasks, expenses, addCustomer, deleteCustomer, addLeaveRequest, updateLeaveRequestStatus, addMeetingForm, updateMeetingForm, addVehicleLog, addTask, updateTask, addExpense, addOffer };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};