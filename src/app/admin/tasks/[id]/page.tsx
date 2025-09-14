import { Metadata } from 'next';
import getTaskByIdAction from "@/actions/dashboard/getTaskByIdAction";
import { ITask } from "@/models/Task";
import { notFound } from 'next/navigation';
import BaseContainer from '@/components/BaseContainer';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await getTaskByIdAction(params.id);
  
  if (response.status === 'success' && response.item) {
    const task = response.item as ITask;
    return {
      title: `Задача: ${task.description} - Админ панель`,
      description: `Детальная информация о задаче для ${task.customerName}`
    };
  }
  
  return {
    title: 'Задача не найдена - Админ панель',
    description: 'Запрашиваемая задача не найдена'
  };
}

const TaskDetailPage = async ({ params }: Props) => {
  const response = await getTaskByIdAction(params.id);

  if (response.status !== 'success' || !response.item) {
    notFound();
  }

  const task = response.item as ITask;

  return (
    <BaseContainer className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Детали задачи</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-gray-700">{task.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Статус</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'Completed' ? 'Завершено' :
                 task.status === 'In Progress' ? 'В работе' : 'Ожидает'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Клиент</h3>
              <p className="text-gray-700">{task.customerName}</p>
              <p className="text-gray-600">{task.customerPhone}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Устройство</h3>
              <p className="text-gray-700">{task.laptopBrand} {task.laptopModel}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Стоимость</h3>
              <p className="text-gray-700">{task.totalCost} ₽</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Дата создания</h3>
              <p className="text-gray-700">{new Date(task.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};

export default TaskDetailPage;