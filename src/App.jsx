import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Check,
  Edit2,
  Trash2,
  ListChecks,
  PieChart,
  ClipboardList,
  ArrowRight,
  CalendarPlus,
  Heart,
  Github,
} from "lucide-react";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // LocalStorage theke data load korar jonno
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("planner_events");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading events from localStorage", e);
      return {};
    }
  });

  const [monthGeneralTodos, setMonthGeneralTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("planner_month_todos");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading month todos from localStorage", e);
      return {};
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMonthViewOpen, setIsMonthViewOpen] = useState(false);
  const [monthActiveTab, setMonthActiveTab] = useState("add");
  const [selectedDate, setSelectedDate] = useState(null);
  const [todoText, setTodoText] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const [editingId, setEditingId] = useState(null);

  // New State: Month goal theke daily-te assign korar jonno
  const [assigningId, setAssigningId] = useState(null);
  const [dayToAssign, setDayToAssign] = useState("");

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  // Data change hole LocalStorage-e save hobe
  useEffect(() => {
    localStorage.setItem("planner_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(
      "planner_month_todos",
      JSON.stringify(monthGeneralTodos)
    );
  }, [monthGeneralTodos]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateClick = (day) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    setSelectedDate(dateKey);
    setIsModalOpen(true);
    setEditingId(null);
    setTodoText("");
  };

  const handleAddOrEditTodo = () => {
    if (!todoText.trim()) return;
    const newEvents = { ...events };
    if (!newEvents[selectedDate]) newEvents[selectedDate] = [];

    if (editingId) {
      newEvents[selectedDate] = newEvents[selectedDate].map((todo) =>
        todo.id === editingId ? { ...todo, text: todoText } : todo
      );
    } else {
      newEvents[selectedDate].push({
        id: Date.now().toString(),
        text: todoText,
        completed: false,
        sourceGoalId: null,
      });
    }

    setEvents(newEvents);
    setTodoText("");
    setEditingId(null);
  };

  const handleAssignToDay = (taskText, sourceGoalId) => {
    const dayNum = parseInt(dayToAssign);
    const maxDays = daysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

    if (!dayNum || dayNum < 1 || dayNum > maxDays) {
      return;
    }

    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${dayNum}`;
    const newEvents = { ...events };
    if (!newEvents[dateKey]) newEvents[dateKey] = [];

    newEvents[dateKey].push({
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      sourceGoalId: sourceGoalId,
    });

    setEvents(newEvents);
    setAssigningId(null);
    setDayToAssign("");
  };

  const toggleDayTodo = (dateKey, id) => {
    const newEvents = { ...events };
    let linkedGoalId = null;
    let targetStatus = false;

    newEvents[dateKey] = newEvents[dateKey].map((todo) => {
      if (todo.id === id) {
        linkedGoalId = todo.sourceGoalId;
        targetStatus = !todo.completed;
        return { ...todo, completed: targetStatus };
      }
      return todo;
    });

    setEvents(newEvents);

    if (linkedGoalId && monthGeneralTodos[monthKey]) {
      const newMonthTodos = { ...monthGeneralTodos };
      newMonthTodos[monthKey] = newMonthTodos[monthKey].map((goal) =>
        goal.id === linkedGoalId ? { ...goal, completed: targetStatus } : goal
      );
      setMonthGeneralTodos(newMonthTodos);
    }
  };

  const deleteDayTodo = (dateKey, id) => {
    const newEvents = { ...events };
    newEvents[dateKey] = newEvents[dateKey].filter((todo) => todo.id !== id);
    if (newEvents[dateKey].length === 0) delete newEvents[dateKey];
    setEvents(newEvents);
  };

  const handleAddMonthTodo = () => {
    if (!monthInput.trim()) return;
    const currentMonthTasks = monthGeneralTodos[monthKey] || [];
    const newMonthTodos = {
      ...monthGeneralTodos,
      [monthKey]: [
        ...currentMonthTasks,
        { id: Date.now().toString(), text: monthInput, completed: false },
      ],
    };
    setMonthGeneralTodos(newMonthTodos);
    setMonthInput("");
  };

  const toggleMonthTodo = (id) => {
    const updated = { ...monthGeneralTodos };
    updated[monthKey] = updated[monthKey].map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setMonthGeneralTodos(updated);
  };

  const deleteMonthTodo = (id) => {
    const updated = { ...monthGeneralTodos };
    updated[monthKey] = updated[monthKey].filter((t) => t.id !== id);
    setMonthGeneralTodos(updated);
  };

  const getGroupedMonthTasks = () => {
    const dailyGrouped = {};
    const prefix = `${currentDate.getFullYear()}-${currentDate.getMonth()}-`;

    const sortedKeys = Object.keys(events)
      .filter((k) => k.startsWith(prefix))
      .sort((a, b) => {
        const dayA = parseInt(a.split("-")[2]);
        const dayB = parseInt(b.split("-")[2]);
        return dayA - dayB;
      });

    sortedKeys.forEach((key) => {
      dailyGrouped[key] = events[key];
    });

    return {
      general: monthGeneralTodos[monthKey] || [],
      daily: dailyGrouped,
    };
  };

  const groupedTasks = getGroupedMonthTasks();
  const totalDaily = Object.values(groupedTasks.daily).flat().length;
  const totalGeneral = groupedTasks.general.length;
  const totalTasks = totalDaily + totalGeneral;
  const completedCount = [
    ...Object.values(groupedTasks.daily).flat(),
    ...groupedTasks.general,
  ].filter((t) => t.completed).length;

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const startDay = firstDayOfMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

    for (let i = 0; i < startDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[90px] sm:h-32 border border-gray-100 bg-gray-50/30"
        ></div>
      );
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
      const isToday =
        new Date().toDateString() ===
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        ).toDateString();
      const dayTodos = events[dateKey] || [];
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-[90px] sm:h-32 border border-gray-100 p-2 cursor-pointer transition-all hover:bg-blue-50 relative flex flex-col ${
            isToday ? "bg-blue-50/50 shadow-inner" : "bg-white"
          }`}
        >
          <span
            className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full mb-1 ${
              isToday ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            {day}
          </span>
          <div className="flex-1 space-y-1 overflow-hidden">
            {dayTodos.slice(0, 2).map((todo) => (
              <div
                key={todo.id}
                className={`text-[10px] p-1 rounded truncate border-l-2 ${
                  todo.completed
                    ? "bg-green-50 border-green-400 text-green-700 line-through"
                    : "bg-blue-50 border-blue-400 text-blue-700"
                }`}
              >
                {todo.text}
              </div>
            ))}
            {dayTodos.length > 2 && (
              <div className="text-[9px] text-gray-400 font-medium">
                + {dayTodos.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-8 font-sans flex flex-col">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex-1 w-full">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-100 p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                Monthly Planner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsMonthViewOpen(true);
                setMonthActiveTab("add");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 shadow-md transition-colors"
            >
              <ListChecks size={16} /> Current Month Todo
            </button>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 text-xs font-bold"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 font-bold text-[10px] text-slate-400 uppercase py-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">{renderDays()}</div>
      </div>

      {/* Footer Section */}
      <footer className="max-w-5xl mx-auto mt-8 pb-8 text-center w-full">
        <a
          href="https://jainulislam.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600 hover:shadow-md transition-all group"
        >
          <span className="text-sm font-bold">Developed with</span>
          <Heart
            size={16}
            className="text-red-500 fill-red-500 group-hover:scale-110 transition-transform"
          />
          <span className="text-sm font-bold">by</span>
          <span className="text-sm font-black text-slate-800 group-hover:text-blue-600">
            Jainul Islam
          </span>
          <img
            src="https://jainulislam.netlify.app/images/logo.png"
            alt=""
            srcset=""
            width={35}
          />
        </a>
      </footer>

      {/* Month Modal */}
      {isMonthViewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex gap-6">
                <button
                  onClick={() => setMonthActiveTab("add")}
                  className={`flex items-center gap-2 pb-2 transition-all ${
                    monthActiveTab === "add"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <ClipboardList size={18} />{" "}
                  <span className="text-sm font-bold uppercase">Add Goals</span>
                </button>
                <button
                  onClick={() => setMonthActiveTab("review")}
                  className={`flex items-center gap-2 pb-2 transition-all ${
                    monthActiveTab === "review"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <PieChart size={18} />{" "}
                  <span className="text-sm font-bold uppercase">
                    Task Review
                  </span>
                </button>
              </div>
              <button
                onClick={() => setIsMonthViewOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {monthActiveTab === "add" ? (
              <>
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Set a goal for the entire month..."
                    value={monthInput}
                    onChange={(e) => setMonthInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMonthTodo()}
                  />
                  <button
                    onClick={handleAddMonthTodo}
                    className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {(monthGeneralTodos[monthKey] || []).map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex flex-col gap-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMonthTodo(todo.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-slate-200"
                          }`}
                        >
                          {todo.completed && <Check size={14} />}
                        </button>
                        <span
                          className={`flex-1 text-sm font-medium ${
                            todo.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }`}
                        >
                          {todo.text}
                        </span>

                        <button
                          onClick={() =>
                            setAssigningId(
                              assigningId === todo.id ? null : todo.id
                            )
                          }
                          title="Assign to a day"
                          className={`p-1.5 rounded-lg transition-colors ${
                            assigningId === todo.id
                              ? "bg-blue-100 text-blue-600"
                              : "text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          <CalendarPlus size={18} />
                        </button>

                        <button
                          onClick={() => deleteMonthTodo(todo.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {assigningId === todo.id && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in slide-in-from-top-1 duration-200">
                          <span className="text-[10px] font-bold uppercase text-blue-600">
                            Assign to Day:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            className="w-16 bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder="1-31"
                            value={dayToAssign}
                            onChange={(e) => setDayToAssign(e.target.value)}
                          />
                          <button
                            onClick={() =>
                              handleAssignToDay(todo.text, todo.id)
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                          >
                            Add to Daily
                          </button>
                          <button
                            onClick={() => setAssigningId(null)}
                            className="text-slate-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!monthGeneralTodos[monthKey] ||
                    monthGeneralTodos[monthKey].length === 0) && (
                    <div className="text-center py-10 text-slate-300 italic">
                      No general goals added yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="text-2xl font-black text-slate-800">
                      {totalTasks}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Total
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="text-2xl font-black text-green-600">
                      {completedCount}
                    </div>
                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider">
                      Done
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="text-2xl font-black text-blue-600">
                      {totalTasks > 0
                        ? Math.round((completedCount / totalTasks) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                      Progress
                    </div>
                  </div>
                </div>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <ClipboardList size={18} />
                    <h4 className="text-sm font-black uppercase tracking-tight">
                      General Month Goals
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {groupedTasks.general.length > 0 ? (
                      groupedTasks.general.map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm ${
                            t.completed ? "opacity-60" : ""
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              t.completed ? "bg-green-500" : "bg-purple-400"
                            }`}
                          ></div>
                          <span
                            className={`flex-1 text-sm ${
                              t.completed
                                ? "line-through text-slate-400"
                                : "text-slate-700"
                            }`}
                          >
                            {t.text}
                          </span>
                          {t.completed && (
                            <Check className="text-green-500" size={16} />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic px-2">
                        No general goals set.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <CalendarIcon size={18} />
                    <h4 className="text-sm font-black uppercase tracking-tight">
                      Daily Activity Breakdown
                    </h4>
                  </div>

                  {Object.keys(groupedTasks.daily).length > 0 ? (
                    Object.entries(groupedTasks.daily).map(
                      ([dateKey, tasks]) => {
                        const day = dateKey.split("-")[2];
                        return (
                          <div
                            key={dateKey}
                            className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                          >
                            <div className="sm:w-20 flex-shrink-0 flex sm:flex-col items-center justify-center bg-slate-50 rounded-xl py-2 px-3 sm:px-0">
                              <span className="text-xs font-bold text-slate-400 uppercase leading-none">
                                Day
                              </span>
                              <span className="text-xl font-black text-slate-800 ml-1 sm:ml-0">
                                {day}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2 pt-1">
                              {tasks.map((t) => (
                                <div
                                  key={t.id}
                                  className="flex items-start gap-2 group"
                                >
                                  <ArrowRight
                                    size={14}
                                    className={`mt-1 flex-shrink-0 ${
                                      t.completed
                                        ? "text-green-500"
                                        : "text-slate-300"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm leading-tight ${
                                      t.completed
                                        ? "line-through text-slate-400"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {t.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-xs text-slate-400 italic px-2">
                      No daily tasks recorded this month.
                    </p>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Modal (Task Manager) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800">
                  Date: {selectedDate}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                  Daily Tasks
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex gap-2 bg-slate-50">
              <input
                type="text"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  editingId ? "Edit task..." : "What needs to be done?"
                }
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOrEditTodo()}
              />
              <button
                onClick={handleAddOrEditTodo}
                className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
              >
                {editingId ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              {(events[selectedDate] || []).map((t) => (
                <div
                  key={t.id}
                  className="group flex items-center gap-3 p-3.5 rounded-2xl border bg-white border-slate-200 shadow-sm transition-all hover:border-blue-100"
                >
                  <button
                    onClick={() => toggleDayTodo(selectedDate, t.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      t.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-slate-200"
                    }`}
                  >
                    {t.completed && <Check size={12} />}
                  </button>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      t.completed ? "text-slate-400 line-through" : ""
                    }`}
                  >
                    {t.text}
                  </span>
                  <div className="flex gap-1 transition-opacity">
                    <button
                      onClick={() => {
                        setTodoText(t.text);
                        setEditingId(t.id);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteDayTodo(selectedDate, t.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(!events[selectedDate] || events[selectedDate].length === 0) && (
                <div className="text-center py-6 text-slate-300 italic text-sm">
                  No tasks for this day yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
