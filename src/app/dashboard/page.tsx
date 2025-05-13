'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';


const typingTexts = [
  'I want to get in shape.',
  'I want to launch a business.',
  'I want a daily morning routine.',
];

interface Task {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  scheduledAt: string;
  updatedAt: string;
  priority: 'high' | 'medium' | 'low';
  recurrenceRule?: 'daily' | 'weekly' | 'monthly' | 'yearly' | '';
  duration?: number;
  deadline?: string;
}

// Helper to parse floating local datetime (yyyy-mm-ddTHH:MM, no timezone)
function parseFloatingDatetime(isoString: string): Date {
  const [datePart, timePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}
  // Recurrence logic removed: Only show if scheduledAt is today and not complete
  const isTaskForToday = (task: Task) => {
    if (task.isComplete) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledAt = parseFloatingDatetime(task.scheduledAt);
    scheduledAt.setHours(0, 0, 0, 0);

    return (
      today.getFullYear() === scheduledAt.getFullYear() &&
      today.getMonth() === scheduledAt.getMonth() &&
      today.getDate() === scheduledAt.getDate()
    );
  };

  // Overdue filter
  const isOverdue = (task: Task) => {
    if (task.isComplete) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledAt = parseFloatingDatetime(task.scheduledAt);
    scheduledAt.setHours(0, 0, 0, 0);
    return scheduledAt < today && !isTaskForToday(task);
  };

  const isCompletedToday = (task: Task) => {
    if (!task.isComplete) return false;

    const completedAt = new Date(task.updatedAt || task.scheduledAt); // fallback to scheduledAt if no updatedAt
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    return sameDay(today, completedAt);
  };


function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return tasks.slice().sort((a, b) => {
    // Completed tasks go to the end, sorted by updatedAt descending (most recent last)
    if (a.isComplete && !b.isComplete) return 1;
    if (!a.isComplete && b.isComplete) return -1;
    if (a.isComplete && b.isComplete) {
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();
      return aUpdated - bUpdated; // earlier updatedAt first
    }

    // 1. Unscheduled tasks come first
    const aHasTime = Boolean(a.scheduledAt);
    const bHasTime = Boolean(b.scheduledAt);
    if (!aHasTime && bHasTime) return -1;
    if (aHasTime && !bHasTime) return 1;

    // 2. If both are unscheduled, sort by priority
    if (!aHasTime && !bHasTime) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // 3. If both are scheduled, sort by scheduledAt
    const aTime = parseFloatingDatetime(a.scheduledAt).getTime();
    const bTime = parseFloatingDatetime(b.scheduledAt).getTime();
    if (aTime !== bTime) return aTime - bTime;

    // 4. If same time, sort by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  // Removed unused state
  // Remove showModal, use editingTaskId for edit, and a flag for add
  // Removed unused state
  const [showAddTask, setShowAddTask] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [isTypingLocked, setIsTypingLocked] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('low');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Duration fields
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState('minutes');
  // Scheduled time for scheduledAt
  const [scheduledTime, setScheduledTime] = useState('');
  // Deadline fields (commented out in UI below, but keep state for possible use)
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState('');
  // Track if we're editing an existing task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) {
      router.replace('/');
    }
  }, [session, router]);


  // const handleSetGoal = async () => {
  //   setIsTypingLocked(true);

  //   const res = await fetch('/api/subscription/status');
  //   const data = await res.json();

  //   if (!res.ok || !['active', 'trialing'].includes(data.subscriptionStatus)) {
  //     router.push('/pricing');
  //     return;
  //   }

  //   const aiRes = await fetch('/api/generate-plan', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ goal: goalInput }),
  //   });
    
  //   if (aiRes.ok && aiRes.headers.get('Content-Type')?.includes('application/json')) {
  //     const { tasks, goalId } = await aiRes.json();

  //     // for (const task of tasks) {
  //     //   const {
  //     //     title,
  //     //     description,
  //     //     scheduledAt,
  //     //     duration,
  //     //     isRecurring,
  //     //     recurrenceRule,
  //     //     priority
  //     //   } = task;

  //     //   await fetch('/api/tasks', {
  //     //     method: 'POST',
  //     //     headers: { 'Content-Type': 'application/json' },
  //     //     body: JSON.stringify({
  //     //       title,
  //     //       description,
  //     //       scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
  //     //       duration,
  //     //       isRecurring,
  //     //       recurrenceRule,
  //     //       priority: priority || 'low',
  //     //       goalId,
  //     //     }),
  //     //   });
  //     // }

  //     setGoalInput('');
  //     setIsTypingLocked(false);
  //     window.location.reload(); // Or re-fetch tasks dynamically
  //   } else {
  //     const errorText = await aiRes.text();
  //     console.error('Failed to generate plan:', errorText);
  //   }
  // };

  // (Task interface already declared above)
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Toggle for Today's Tasks vs Upcoming/Completed Tasks
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!session || isTypingLocked) return;

    const fullText = typingTexts[textIndex];

    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        setCurrentText(fullText.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCharIndex(0);
          setTextIndex((prev) => (prev + 1) % typingTexts.length);
          setCurrentText(''); // Clear before next text starts
        }, 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [charIndex, textIndex, session, isTypingLocked]);

  useEffect(() => {
    // const fetchTasks = async () => {
    //   setIsLoading(true);
    //   try {
    //     const res = await fetch('/api/tasks');
    //     const data = await res.json();
    //     if (res.ok && data.data) {
    //       setTasks(sortTasks(data.data));
    //     }
    //   } catch (err) {
    //     console.error('Failed to fetch tasks:', err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-left mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Today</h1>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Need help scheduling?
          </label>
          <div className="flex gap-3 transform hover:scale-102 transition-transform duration-300">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => {
                setGoalInput(e.target.value);
                setIsTypingLocked(true);
              }}
              placeholder={goalInput ? '' : currentText}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium bg-gray-50 cursor-text hover:bg-white hover:shadow-lg duration-200 focus:outline-none focus:ring-0"
            />
            <button
              className="min-w-[100px] px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              Set Goal
            </button>
          </div>
        </div>
      </div>

      {/* Toggle for Today's Tasks vs Upcoming vs Completed */}
      <div className="flex justify-center mb-6 gap-2">
        <button
          onClick={() => { setShowUpcoming(false); setShowCompleted(false); }}
          className={`px-4 py-2 rounded-lg ${!showUpcoming && !showCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Today
        </button>
        <button
          onClick={() => { setShowUpcoming(true); setShowCompleted(false); }}
          className={`px-4 py-2 rounded-lg ${showUpcoming && !showCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => { setShowCompleted(true); setShowUpcoming(false); }}
          className={`px-4 py-2 rounded-lg ${showCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Completed
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Overdue Section */}
        {!showCompleted && !showUpcoming && tasks.some(isOverdue) && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-red-600">Overdue</h2>
              <button
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reschedule All
              </button>
            </div>
            {tasks
              .filter(isOverdue)
              .map((task: any) => (
                <div key={task.id} className="flex items-center justify-between border-b border-gray-200 py-2 relative">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    {(() => {
                      // Overdue: Always show only the date (no time), until rescheduled
                      const start = parseFloatingDatetime(task.scheduledAt);
                      const formattedDate = start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                      return (
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                      );
                    })()}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      title="Reschedule"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      title="Delete"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        {/* Skeleton Loader */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm">
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-gray-100 rounded mb-4"></div>
                <div className="h-2.5 bg-gray-200 rounded-full w-full mb-2"></div>
              </div>
            ))}
          </div>
        )}
        {/* Main Task List */}
        {tasks.length > 0 && (
          <>
            {tasks
              .filter((task: Task) => {
                if (showCompleted) {
                  return task.isComplete;
                }
                if (showUpcoming) {
                  if (task.isComplete) return false;

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const scheduledAt = parseFloatingDatetime(task.scheduledAt);
                  scheduledAt.setHours(0, 0, 0, 0);
                  return scheduledAt > today;
                }
                // Today view: show incomplete for today + completed today
                return isTaskForToday(task) || isCompletedToday(task);
              })
              .map((task: Task, index: number, filteredTasks: Task[]) => {
                // Calculate showCompletedDivider for filtered list
                const showCompletedDivider =
                  !showUpcoming && !showCompleted &&
                  index > 0 &&
                  filteredTasks[index - 1].isComplete === false &&
                  task.isComplete === true;
                return (
                  <div key={task.id}>
                    {showCompletedDivider && (
                      <div className="text-xs text-gray-400 uppercase tracking-wide py-2">
                        Completed
                      </div>
                    )}
                    <div className="flex items-start justify-between border-b border-gray-200 py-4 relative">
                    <div className="flex items-center gap-3 w-full">
                      {editingTaskId !== task.id && (
                        <button
                          className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                            task.isComplete
                              ? 'bg-red-600 border-red-600'
                              : 'border-gray-400 hover:border-gray-600'
                          } hover:shadow-md transition-all`}
                          title="Mark Complete/Incomplete"
                        />
                      )}
                      <div className={editingTaskId === task.id ? "flex-grow" : undefined}>
                        {editingTaskId === task.id ? (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setIsSubmitting(true);
                              try {
                                // Compose scheduledAt from dueDate and scheduledTime
                                const composedScheduledAt = scheduledTime
                                  ? new Date(`${dueDate}T${scheduledTime}`).toISOString()
                                  : new Date(`${dueDate}T00:00`).toISOString();
                                // Compose duration in minutes
                                const composedDuration = durationValue
                                  ? Number(durationUnit === 'hours' ? Number(durationValue) * 60 : durationValue)
                                  : undefined;
                                // Compose deadline (still present in data, but field is commented out below)
                                const composedDeadline = deadlineDate
                                  ? new Date(`${deadlineDate}T${deadlineTime || '00:00'}`).toISOString()
                                  : undefined;
                                const res = await fetch(`/api/tasks/${editingTaskId}/update`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    title,
                                    description,
                                    dueDate,
                                    scheduledAt: composedScheduledAt,
                                    priority: priority || 'low',
                                    duration: composedDuration,
                                    deadline: composedDeadline,
                                    isRecurring: !!recurrenceRule,
                                    recurrenceRule: recurrenceRule || undefined,
                                  }),
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setTasks((prev) =>
                                    sortTasks(
                                      prev.map((t) => (t.id === updated.task.id ? { ...t, ...updated.task } : t))
                                    )
                                  );
                                  setEditingTaskId(null);
                                  setTitle('');
                                  setDescription('');
                                  setDueDate(new Date().toISOString().split('T')[0]);
                                  setPriority('medium');
                                  setDurationValue('');
                                  setDurationUnit('minutes');
                                  setScheduledTime('');
                                  setDeadlineDate('');
                                  setDeadlineTime('');
                                  setRecurrenceRule('');
                                }
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            className="w-full border border-gray-200 rounded-xl p-4 space-y-4"
                          >
                            <div>
                              <input
                                type="text"
                                placeholder="Task title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                <input
                                  type="date"
                                  value={dueDate}
                                  onChange={(e) => setDueDate(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                  required
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                                <input
                                  type="time"
                                  value={scheduledTime}
                                  onChange={(e) => setScheduledTime(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                />
                              </div>
                              {/* 
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Deadline (Optional)</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="date"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                  />
                                  <input
                                    type="time"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                  />
                                </div>
                              </div>
                              */}
                              <div className="sm:col-span-1 max-w-xs">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                <select
                                  value={priority}
                                  onChange={(e) => setPriority(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                              <div className="sm:col-span-1 max-w-xs">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Repeat</label>
                                <select
                                  value={recurrenceRule}
                                  onChange={(e) => setRecurrenceRule(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                >
                                  <option value="">None</option>
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={durationValue}
                                  onChange={(e) => setDurationValue(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                  placeholder="Duration"
                                  min="0"
                                />
                                <select
                                  value={durationUnit}
                                  onChange={(e) => setDurationUnit(e.target.value)}
                                  className="border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                                >
                                  <option value="minutes">Minutes</option>
                                  <option value="hours">Hours</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting || !title.trim()}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
                              >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-base font-medium ${
                                task.isComplete
                                  ? 'line-through text-gray-400'
                                  : task.priority === 'high'
                                  ? 'text-red-600'
                                  : task.priority === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-gray-900'
                              }`}>
                                {task.title}
                                {/* Recurring icon */}
                                {task.recurrenceRule && (
                                  <ArrowPathIcon className="w-4 h-4 text-gray-400 ml-2 inline-block" title="Recurring task" />
                                )}
                              </p>
                              {!showCompleted && (
                                <div className="absolute right-0 top-0 mt-1 mr-1 flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingTaskId(task.id);
                                      setShowAddTask(false); // Close add modal if open
                                      setTitle(task.title);
                                      setDescription(task.description || '');
                                      setDueDate(task.scheduledAt.split('T')[0]);
                                      setPriority(task.priority);
                                      setScheduledTime(task.scheduledAt ? new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
                                      setDurationValue(task.duration ? String(task.duration) : '');
                                      setDurationUnit('minutes');
                                      setDeadlineDate(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
                                      setDeadlineTime(task.deadline ? new Date(task.deadline).toISOString().split('T')[1]?.slice(0,5) : '');
                                      setRecurrenceRule(task.recurrenceRule || '');
                                    }}
                                    title="Edit"
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <PencilIcon className="w-4 h-4 text-blue-500" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await fetch(`/api/tasks/${task.id}/delete`, { method: 'DELETE' });
                                        setTasks((prev) => prev.filter((t) => t.id !== task.id));
                                      } catch (err) {
                                        console.error('Error deleting task:', err);
                                      }
                                    }}
                                    title="Delete"
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <TrashIcon className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {task.description && (
                              <p className={`text-sm ${task.isComplete ? 'text-gray-300' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                            )}
                            {/* --- Upcoming: show next recurrence date --- */}
                            {!task.isComplete && showUpcoming && (() => {
                              const getNextDate = () => {
                                const baseDate = parseFloatingDatetime(task.scheduledAt);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                let nextDate = new Date(baseDate);
                                while (nextDate <= today) {
                                  if (task.recurrenceRule === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                                  else if (task.recurrenceRule === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                                  else if (task.recurrenceRule === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                                  else if (task.recurrenceRule === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                                  else break;
                                }
                                return nextDate;
                              };

                              const next = getNextDate();
                              if (next.getTime() <= (new Date(new Date().setHours(0,0,0,0))).getTime()) return null;
                              const formatted = next.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              });
                              return <p className="text-xs text-gray-500 mt-1">{formatted}</p>;
                            })()}
                            {/* Scheduled time block (before deadline) */}
                            {!task.isComplete && task.scheduledAt && (() => {
                              const start = parseFloatingDatetime(task.scheduledAt);
                              const hasTime = start.getHours() !== 0 || start.getMinutes() !== 0;
                              if (!hasTime) return null;
                              const startTime = start.toLocaleTimeString(undefined, {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // ensures local
                              });
                              const end =
                                task.duration && hasTime
                                  ? new Date(start.getTime() + task.duration * 60000)
                                  : null;
                              const endTime = end
                                ? end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                                : null;
                              return (
                                <p className="text-xs text-gray-500 mt-1">
                                  {endTime ? `${startTime} - ${endTime}` : startTime}
                                </p>
                              );
                            })()}
                            {/* Deadline block (after scheduled time) */}
                            {/* {!task.isComplete && task.deadline && (() => {
                              const deadlineDate = new Date(task.deadline);
                              const now = new Date();
                              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              const tomorrow = new Date(today);
                              tomorrow.setDate(today.getDate() + 1);

                              const isToday = deadlineDate.toDateString() === today.toDateString();
                              const isTomorrow = deadlineDate.toDateString() === tomorrow.toDateString();

                              const time = deadlineDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                              const hasTime = deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0;

                              let label = '';
                              if (isToday) {
                                label = hasTime ? `Today at ${time}` : 'Today';
                              } else if (isTomorrow) {
                                label = hasTime ? `Tomorrow at ${time}` : 'Tomorrow';
                              } else {
                                label = deadlineDate.toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                });
                                if (hasTime) label += ` at ${time}`;
                              }

                              return <p className="text-xs text-gray-500 mt-1">Deadline: {label}</p>;
                            })} */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Show Recently Completed Tasks for Today */}
      {/* {!showCompleted && !showUpcoming && tasks.some(isCompletedToday) && (
        <>
          <div className="text-xs text-gray-400 uppercase tracking-wide py-2">Completed</div>
          {tasks
            .filter(isCompletedToday)
            .map((task) => (
              <div key={task.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-400 line-through">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-400">{task.description}</p>}
                </div>
              </div>
            ))}
        </>
      )} */}

      {/* Hide Add Task button and form in Completed view */}
      {!showCompleted && (
        <div className="max-w-4xl mx-auto mt-10">
          {!showAddTask && (
            <button
              onClick={() => {
                setShowAddTask(true);
                setEditingTaskId(null);
                setTitle('');
                setDescription('');
                setDueDate(new Date().toISOString().split('T')[0]);
                setPriority('low');
                setDurationValue('');
                setDeadlineDate('');
                setDeadlineTime('');
                setRecurrenceRule('');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
            >
              <PlusIcon className="h-5 w-5 mr-2 text-gray-500" />
              Add Task
            </button>
          )}
          {showAddTask && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  // Compose scheduledAt from dueDate and scheduledTime
                  const composedScheduledAt = scheduledTime
                    ? new Date(`${dueDate}T${scheduledTime}`).toISOString()
                    : new Date(`${dueDate}T00:00`).toISOString();
                  // Compose duration in minutes
                  const composedDuration = durationValue
                    ? Number(durationUnit === 'hours' ? Number(durationValue) * 60 : durationValue)
                    : undefined;
                  // Compose deadline (still present in data, but field is commented out below)
                  const composedDeadline = deadlineDate
                    ? new Date(`${deadlineDate}T${deadlineTime || '00:00'}`).toISOString()
                    : undefined;
                  const res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title,
                      description,
                      dueDate,
                      scheduledAt: composedScheduledAt,
                      priority: priority || 'low',
                      duration: composedDuration,
                      deadline: composedDeadline,
                      isRecurring: !!recurrenceRule,
                      recurrenceRule: recurrenceRule || undefined,
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setTasks((prev) => sortTasks([...prev, data.data]));
                    setShowAddTask(false);
                    setTitle('');
                    setDescription('');
                    setDueDate(new Date().toISOString().split('T')[0]);
                    setPriority('low');
                    setDurationValue('');
                    setDurationUnit('minutes');
                    setScheduledTime('');
                    setDeadlineDate('');
                    setDeadlineTime('');
                    setRecurrenceRule('');
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="border border-gray-200 rounded-xl p-4 space-y-4"
            >
              <div>
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                  />
                </div>
                {/* 
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deadline (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                    />
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                    />
                  </div>
                </div>
                */}
                <div className="sm:col-span-1 max-w-xs">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="sm:col-span-1 max-w-xs">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Repeat</label>
                  <select
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                  >
                    <option value="">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                    placeholder="Duration"
                    min="0"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                  }}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  {isSubmitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
