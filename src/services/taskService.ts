import Task, { ITask } from '@/models/Task';
import User, { IUser } from '@/models/User';
import axios from 'axios';
import { AddTaskActionParams } from "@/types";
import mongoose from 'mongoose';

export const getWorkerWithLeastTasks = async (): Promise<IUser | null> => {
  const workers = await User.find({ role: 'worker' }).populate('tasks');
  if (workers.length === 0) return null;

  let selectedWorker = workers[0];
  let leastTasksCount = selectedWorker.tasks?.length ?? 0;

  workers.forEach(worker => {
    const taskCount = worker.tasks?.length ?? 0;
    if (taskCount < leastTasksCount) {
      selectedWorker = worker;
      leastTasksCount = taskCount;
    }
  });

  return selectedWorker;
};

export const assignTaskToWorker = async (worker: IUser, taskId: mongoose.Types.ObjectId): Promise<void> => {
  worker.tasks = worker.tasks || [];
  worker.tasks.unshift(taskId);
  await worker.save();
};

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

export async function sendInvoiceToWhatsApp(invoiceDetails: {
  customerName: string;
  customerPhone: string;
  laptopBrand: string;
  laptopModel: string;
  serialNumber: string;
  totalCost: number;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
}) {
  const apiKey = process.env.TEXTMEBOT_API_KEY;
  const companyName = "Servy";

  if (!apiKey) {
    console.error("API key is missing!");
    return { status: "error", message: "API key is missing!" };
  }

  const {
    customerName,
    customerPhone,
    laptopBrand,
    laptopModel,
    serialNumber,
    totalCost,
    description,
    status,
  } = invoiceDetails;

  const message = `
    *Invoice Details*:

    *Customer Name:* ${customerName}
    *Phone Number:* ${customerPhone}

    *Laptop Brand:* ${laptopBrand}
    *Laptop Model:* ${laptopModel}
    *Serial Number:* ${serialNumber}

    *Service Description:* ${description}
    *Status:* ${status}

    *Total Cost:* $${totalCost.toFixed(2)}

    Thank you for using our service!

    Regards,
    ${companyName}
  `;

  const encodedMessage = encodeURIComponent(message);

  const url = `https://api.callmebot.com/whatsapp.php?phone=${normalizePhoneNumber(customerPhone)}&text=${encodedMessage}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      console.log("Invoice sent successfully!");
      return { status: "success", message: "Invoice sent successfully!" };
    } else {
      console.log("Error sending invoice:", response.data);
      return { status: "error", message: "Error sending invoice: " + response.data };
    }
  } catch (error) {
    console.error("Error sending invoice:", error);
    return { status: "error", message: "Error sending invoice: " + (error as { message: string }).message };
  }
}

export const createTask = async (params: AddTaskActionParams, worker: IUser): Promise<ITask> => {
  const newTask = new Task({
    ...params,
    workerId: worker._id,
    status: 'Pending',
  });
  await newTask.save();
  return newTask;
};
