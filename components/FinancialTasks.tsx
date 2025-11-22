import React, { useState, useMemo } from 'react';
import { Task, TaskCategory } from '../types.ts';
import { TASK_CATEGORIES } from '../constants.ts';
import { PlusCircleIcon, CalendarDaysIcon, CheckCircleIcon, ClipboardDocumentIcon, XIcon, AnimatedCheckCircleIcon } from './Icons.tsx';
import { DeleteConfirmationModal } from './DeleteConfirmationModal.tsx';

interface FinancialTasksProps {
    tasks: Task[];
    addTask: (text: string, dueDate?: Date, category?: TaskCategory) => void;
    toggleTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
}

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDeleteRequest: (task: Task) => void; }> = ({ task, onToggle, onDeleteRequest }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
    
    const formatDate = (date: Date) => {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`task-item flex items-center p-3 bg-slate-200 rounded-lg shadow-digital-inset transition-opacity duration-300 ${task.completed ? 'opacity-60 task-completed' : ''}`}>
            <button onClick={() => onToggle(task.id)} className="flex-shrink-0 p-1">
                {task.completed ? (
                    <AnimatedCheckCircleIcon className="w-6 h-6" />
                ) : (
                    <div className="w-6 h-6 border-2 border-slate-400 rounded-full hover:border-primary transition-colors"></div>
                )}
            </button>
            <div className="flex-grow mx-3">
                <p className={`text-slate-800 task-text`}>{task.text}</p>
                {task.dueDate && (
                    <div className={`flex items-center space-x-1 text-sm mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                )}
            </div>
            <button onClick={() => onDeleteRequest(task)} className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors">
                 <XIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export const FinancialTasks: React.FC<FinancialTasksProps> = ({ tasks, addTask, toggleTask, deleteTask }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState<TaskCategory>('Financial');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        const date = dueDate ? new Date(dueDate) : undefined;
        if (date) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        }

        addTask(text, date, category);
        setText('');
        setDueDate('');
        setCategory('Financial');
    };

    const pendingTasks = useMemo(() => tasks
        .filter(t => !t.completed)
        .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
        .sort((a,b) => (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity)), [tasks, categoryFilter]);

    const completedTasks = useMemo(() => tasks
        .filter(t => t.completed)
        .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
        .sort((a,b) => (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0)), [tasks, categoryFilter]);

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-8 max-w-3xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Financial Tasks</h2>
                    <p className="text-sm text-slate-500 mt-1">Organize your financial to-dos and stay on top of your goals.</p>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <input 
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a new task..."
                            className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset sm:col-span-4"
                        />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as TaskCategory)}
                            className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset text-slate-600 sm:col-span-2"
                        >
                            {TASK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat} Task</option>)}
                        </select>
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset text-slate-600"
                        />
                        <button type="submit" className="w-full flex-shrink-0 px-4 py-3 bg-primary text-white rounded-lg shadow-md flex items-center justify-center space-x-2">
                            <PlusCircleIcon className="w-5 h-5"/>
                            <span>Add</span>
                        </button>
                    </form>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Status</label>
                        <div className="flex bg-slate-200 p-1 rounded-lg shadow-digital-inset">
                            {(['all', 'pending', 'completed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`w-full capitalize p-2 rounded-md font-semibold text-sm transition-all ${
                                        statusFilter === status
                                            ? 'bg-white shadow-digital text-primary'
                                            : 'text-slate-600'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')}
                            className="w-full bg-slate-200 p-3 rounded-lg shadow-digital-inset text-slate-800"
                        >
                            <option value="all">All Categories</option>
                            {TASK_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    {(statusFilter === 'all' || statusFilter === 'pending') && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Pending</h3>
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDeleteRequest={setTaskToDelete} />)}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                                    <ClipboardDocumentIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                                    <p className="text-slate-500">No pending tasks found.</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {(statusFilter === 'all' || statusFilter === 'completed') && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Completed</h3>
                            {completedTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDeleteRequest={setTaskToDelete} />)}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                                    <ClipboardDocumentIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                                    <p className="text-slate-500">No completed tasks found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {taskToDelete && (
                <DeleteConfirmationModal
                    taskText={taskToDelete.text}
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    );
};