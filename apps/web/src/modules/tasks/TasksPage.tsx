import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FlagOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Input, Modal, Row } from "antd";
import { useEffect, useMemo, useState } from "react";
import type {
  Task,
  TaskOwner,
  TaskPriority,
  TaskRelationType,
  TaskStatus,
  TaskType,
} from "../../types/adminTasks";
import { TASK_BASE_DATE } from "../../types/adminTasks";
import { tasksService } from "../../services";
import { TaskCard } from "./components/TaskCard";
import { TaskForm, eventDateById, isDeadlineAfterEvent, defaultEventFilterForTaskType, isEventRelation } from "./components/TaskForm";
import { TaskFilters, type SortMode } from "./components/TaskFilters";
import { IndicatorsRow, RightPanelCounters } from "./components/TaskIndicators";
import { SelectedTaskDetail, RelatedSection } from "./components/DetailPanel";
import { QuickActionContent, type QuickAction } from "./components/QuickActions";
import { SEED_TASKS } from "./components/seedTasks";

export function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [activeType, setActiveType] = useState<TaskType | "Todos">("Todos");
  const [activeOwner, setActiveOwner] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortMode>("Fecha limite");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [activeAction, setActiveAction] = useState<QuickAction | undefined>();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [createForm, setCreateForm] = useState<Partial<Task>>({
    responsible: "Doctora",
    priority: "Media",
    type: "Administrativa",
    relationType: "Ninguno",
  });
  const [createEventFilter, setCreateEventFilter] = useState("Todos");
  const [editForm, setEditForm] = useState<Partial<Task>>({
    responsible: "Doctora",
    priority: "Media",
    type: "Administrativa",
    relationType: "Ninguno",
  });
  const [editEventFilter, setEditEventFilter] = useState("Todos");

  const currentMonth = TASK_BASE_DATE.slice(0, 7);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    tasksService.list().then((data) => {
      setLocalTasks(data.map((d1: any) => ({
        id: d1.id,
        title: d1.title,
        description: d1.description || "",
        responsible: (d1.assigned_user_id === "doctora" ? "Doctora" : "Asistente") as TaskOwner,
        priority: (d1.priority === "alta" || d1.priority === "Alta" ? "Alta" : d1.priority === "media" || d1.priority === "Media" ? "Media" : "Baja") as TaskPriority,
        deadline: d1.due_at ? d1.due_at.slice(5, 10) : "",
        deadlineDate: d1.due_at ? d1.due_at.slice(0, 10) : "",
        status: (d1.status === "pendiente" || d1.status === "Pendiente" ? "Pendiente" : d1.status === "en_curso" || d1.status === "En curso" ? "En curso" : d1.status === "completada" || d1.status === "Completada" ? "Completada" : "Cancelada") as TaskStatus,
        type: (d1.category === "administrativa" || d1.category === "Administrativa" ? "Administrativa" : d1.category === "seguimiento" || d1.category === "Seguimiento" ? "Seguimiento" : d1.category === "consulta" || d1.category === "Consulta" ? "Consulta" : d1.category === "marketing" || d1.category === "Marketing" ? "Marketing" : d1.category === "empresa" || d1.category === "Empresa" ? "Empresa" : d1.category === "taller" || d1.category === "Taller" ? "Taller" : "Personal") as TaskType,
        relationType: (d1.related_entity_type === "event" ? "Evento" : d1.related_entity_type === "person" ? "Persona" : d1.related_entity_type === "company" ? "Empresa" : "Ninguno") as TaskRelationType,
        relationLabel: d1.related_entity_id || undefined,
        relationMeta: undefined,
      })));
    }).catch(() => {
      setLocalTasks(SEED_TASKS);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...localTasks];

    if (!showHistory) {
      result = result.filter((t) => {
        if (t.status === "Cancelada") return false;
        if (t.status === "Completada" && !t.deadlineDate.startsWith(currentMonth)) return false;
        return true;
      });
    }

    if (activeType !== "Todos") {
      result = result.filter((t) => t.type === activeType);
    }

    if (activeOwner !== "Todos") {
      result = result.filter((t) => t.responsible === activeOwner);
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter((t) =>
        [t.title, t.description, t.responsible, t.type, t.relationLabel, t.relationMeta]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(normalizedSearch)),
      );
    }

    const priorityWeight = (p: TaskPriority): number => {
      if (p === "Alta") return 0;
      if (p === "Media") return 1;
      return 2;
    };

    const statusWeight = (s: TaskStatus): number => {
      if (s === "Pendiente") return 0;
      if (s === "En curso") return 1;
      if (s === "Completada") return 2;
      return 3;
    };

    if (sortBy === "Prioridad") {
      result.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
    } else if (sortBy === "Estado") {
      result.sort((a, b) => statusWeight(a.status) - statusWeight(b.status));
    } else {
      result.sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
    }

    return result;
  }, [localTasks, activeType, activeOwner, searchTerm, sortBy, currentMonth, showHistory]);

  useEffect(() => {
    if (activeAction === "Editar" && selectedTask) {
      setEditForm({
        id: selectedTask.id,
        title: selectedTask.title,
        description: selectedTask.description,
        responsible: selectedTask.responsible,
        priority: selectedTask.priority,
        type: selectedTask.type,
        deadline: selectedTask.deadline,
        deadlineDate: selectedTask.deadlineDate,
        status: selectedTask.status,
        relationType: selectedTask.relationType,
        relationLabel: selectedTask.relationLabel,
        relationMeta: selectedTask.relationMeta,
      });
      setEditEventFilter(defaultEventFilterForTaskType(selectedTask.type));
    }
  }, [activeAction, selectedTask]);

  const handleComplete = (id: string) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Completada" as TaskStatus } : t)));
    setActiveAction(undefined);
  };

  const handleDelete = (id: string) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask((prev) => (prev?.id === id ? undefined : prev));
    setActiveAction(undefined);
  };

  const handleReassign = (id: string, owner: TaskOwner) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, responsible: owner } : t)));
    setActiveAction(undefined);
  };

  const handleChangePriority = (id: string, priority: TaskPriority) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
    setActiveAction(undefined);
  };

  const openAction = (action: QuickAction) => {
    if (action === "Editar" && selectedTask) {
      setEditForm({
        id: selectedTask.id,
        title: selectedTask.title,
        description: selectedTask.description,
        responsible: selectedTask.responsible,
        priority: selectedTask.priority,
        type: selectedTask.type,
        deadline: selectedTask.deadline,
        deadlineDate: selectedTask.deadlineDate,
        status: selectedTask.status,
        relationType: selectedTask.relationType,
        relationLabel: selectedTask.relationLabel,
        relationMeta: selectedTask.relationMeta,
      });
      setEditEventFilter(defaultEventFilterForTaskType(selectedTask.type));
    }
    setActiveAction(action);
  };

  const closeModal = () => {
    setActiveAction(undefined);
  };

  const handleCreateTask = () => {
    const eventDate = isEventRelation(createForm.relationType) && createForm.relationLabel ? eventDateById(createForm.relationLabel) : "";
    const deadlineDate = createForm.deadlineDate ?? "";

    if (!createForm.title?.trim()) return;
    if (eventDate && deadlineDate && isDeadlineAfterEvent(deadlineDate, eventDate)) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: createForm.title.trim(),
      description: createForm.description ?? "",
      responsible: (createForm.responsible ?? "Doctora") as TaskOwner,
      priority: (createForm.priority ?? "Media") as TaskPriority,
      deadline: createForm.deadline ?? createForm.deadlineDate ?? TASK_BASE_DATE,
      deadlineDate: createForm.deadlineDate ?? TASK_BASE_DATE,
      status: "Pendiente",
      type: (createForm.type ?? "Administrativa") as TaskType,
      relationType: (createForm.relationType ?? "Ninguno") as TaskRelationType,
      relationLabel: createForm.relationLabel,
      relationMeta: createForm.relationMeta,
    };

    setLocalTasks((prev) => [newTask, ...prev]);
    setSelectedTask(newTask);
    setCreateForm({ responsible: "Doctora", priority: "Media", type: "Administrativa", relationType: "Ninguno" });
    setCreateEventFilter("Todos");
    setActiveAction(undefined);
  };

  const handleEditTask = () => {
    if (!editForm.id || !editForm.title?.trim()) return;

    const eventDate = isEventRelation(editForm.relationType) && editForm.relationLabel ? eventDateById(editForm.relationLabel) : "";
    const deadlineDate = editForm.deadlineDate ?? "";
    if (eventDate && deadlineDate && isDeadlineAfterEvent(deadlineDate, eventDate)) return;

    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === editForm.id
          ? {
              ...t,
              title: editForm.title!.trim(),
              description: editForm.description ?? "",
              responsible: (editForm.responsible ?? "Doctora") as TaskOwner,
              priority: (editForm.priority ?? "Media") as TaskPriority,
              type: (editForm.type ?? "Administrativa") as TaskType,
              deadline: editForm.deadline ?? editForm.deadlineDate ?? TASK_BASE_DATE,
              deadlineDate: editForm.deadlineDate ?? TASK_BASE_DATE,
              relationType: (editForm.relationType ?? "Ninguno") as TaskRelationType,
              relationLabel: editForm.relationLabel,
              relationMeta: editForm.relationMeta,
            }
          : t,
      ),
    );
    setSelectedTask((prev) =>
      prev && prev.id === editForm.id
        ? {
            ...prev,
            title: editForm.title!.trim(),
            description: editForm.description ?? "",
            responsible: (editForm.responsible ?? "Doctora") as TaskOwner,
            priority: (editForm.priority ?? "Media") as TaskPriority,
            type: (editForm.type ?? "Administrativa") as TaskType,
            deadline: editForm.deadline ?? editForm.deadlineDate ?? TASK_BASE_DATE,
            deadlineDate: editForm.deadlineDate ?? TASK_BASE_DATE,
            relationType: (editForm.relationType ?? "Ninguno") as TaskRelationType,
            relationLabel: editForm.relationLabel,
            relationMeta: editForm.relationMeta,
          }
        : prev,
    );
    setActiveAction(undefined);
  };

  const handleModalOk = () => {
    if (activeAction === "Crear") {
      handleCreateTask();
      return;
    }
    if (activeAction === "Editar") {
      handleEditTask();
      return;
    }
    closeModal();
  };

  const modalOkLabel = activeAction === "Crear" ? "Crear tarea" : activeAction === "Editar" ? "Guardar cambios" : activeAction === "Completar" ? "Completar" : activeAction === "Eliminar" ? "Eliminar" : activeAction === "Reasignar" ? "Reasignar" : activeAction === "Cambiar prioridad" ? "Cambiar" : "Guardar";

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen de tareas</p>
        <h1 className="mt-2 text-xl font-bold text-surface-main sm:mt-3 sm:text-4xl">Tareas</h1>
        <p className="mt-2 max-w-3xl text-xs text-surface-secondary sm:text-sm">
          Organiza, prioriza y da seguimiento a actividades administrativas y clínicas.
        </p>
      </section>

      <Card className="rounded-3xl border-[var(--border)]" styles={{ body: { padding: 16 } }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input.Search
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tarea..."
            className="min-w-0 flex-1 rounded-2xl"
            allowClear
          />
          <Button className="shrink-0 h-9 rounded-button border-[var(--accent-border)] px-5" icon={<PlusOutlined />} onClick={() => openAction("Crear")}>
            Nueva tarea
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={18} className="flex min-h-0 flex-col xl:h-[700px]">
          <div className="grid shrink-0 gap-3">
            <IndicatorsRow tasks={localTasks} filteredTasks={filtered} />

            <TaskFilters
              activeOwner={activeOwner}
              onOwnerChange={setActiveOwner}
              activeType={activeType}
              onTypeChange={setActiveType}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filteredCount={filtered.length}
              showHistory={showHistory}
              onToggleHistory={() => setShowHistory((prev) => !prev)}
            />
          </div>

          <Card className="mt-3 h-auto min-h-0 rounded-3xl border-[var(--border)] xl:flex-1" styles={{ body: { height: "100%", padding: 16 } }}>
            <div className="flex min-h-0 max-h-[420px] flex-col xl:h-full xl:max-h-none">
              <div className="min-h-0 shrink-0 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-surface-main">Tareas ({filtered.length})</p>
                  <div className="flex shrink-0 gap-2">
                    <Button size="small" className="rounded-button" icon={<EditOutlined />} onClick={() => openAction("Editar")} disabled={!selectedTask}>
                      Editar
                    </Button>
                    <Button size="small" className="rounded-button" icon={<CheckCircleOutlined />} onClick={() => openAction("Completar")} disabled={!selectedTask || selectedTask?.status === "Completada"}>
                      Completar
                    </Button>
                    <Button size="small" className="rounded-button" icon={<SwapOutlined />} onClick={() => openAction("Reasignar")} disabled={!selectedTask}>
                      Reasignar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="thin-task-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-scroll pr-1" style={{ scrollbarGutter: "stable" }}>
                {filtered.length > 0 ? (
                  filtered.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isSelected={selectedTask?.id === task.id}
                      onSelect={() => setSelectedTask(task)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-[var(--border-subtle)] p-4 text-sm text-surface-secondary">
                    No hay tareas para esta combinacion de filtros.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={6} className="flex min-h-0 flex-col xl:h-[700px]">
          <Card className="h-auto rounded-3xl border-[var(--border)] xl:h-full" styles={{ body: { height: "100%", padding: 16 } }}>
            <div className="flex h-full max-h-[668px] flex-col xl:max-h-none">
              <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                <SelectedTaskDetail task={selectedTask} />
                <RelatedSection task={selectedTask} />

                <div className="rounded-2xl border border-[var(--border-subtle)] p-3.5">
                  <p className="text-sm font-semibold text-surface-main">Acciones</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button size="small" className="h-8 justify-start rounded-button text-[11px] sm:text-xs" icon={<EditOutlined />} onClick={() => openAction("Editar")}>
                      Editar
                    </Button>
                    <Button size="small" className="h-8 justify-start rounded-button text-[11px] sm:text-xs" icon={<CheckCircleOutlined />} onClick={() => openAction("Completar")}>
                      Completar
                    </Button>
                    <Button size="small" className="h-8 justify-start rounded-button text-[11px] sm:text-xs" icon={<SwapOutlined />} onClick={() => openAction("Reasignar")}>
                      Reasignar
                    </Button>
                    <Button size="small" className="h-8 justify-start rounded-button text-[11px] sm:text-xs" icon={<FlagOutlined />} onClick={() => openAction("Cambiar prioridad")}>
                      Prioridad
                    </Button>
                    <Button size="small" className="h-8 justify-start rounded-button text-[11px] sm:text-xs" icon={<DeleteOutlined />} onClick={() => openAction("Eliminar")}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
              <RightPanelCounters tasks={localTasks} filteredCount={filtered.length} />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        centered
        open={Boolean(activeAction)}
        title={activeAction}
        okText={modalOkLabel}
        cancelText="Cancelar"
        onOk={handleModalOk}
        onCancel={closeModal}
        width={620}
      >
        <div className="pt-2">
          {activeAction === "Crear" ? (
            <TaskForm form={createForm} setForm={setCreateForm} eventFilter={createEventFilter} setEventFilter={setCreateEventFilter} />
          ) : activeAction === "Editar" ? (
            <TaskForm key={editForm.id ?? "edit-task"} form={editForm} setForm={setEditForm} eventFilter={editEventFilter} setEventFilter={setEditEventFilter} />
          ) : activeAction ? (
            <QuickActionContent
              action={activeAction}
              selectedTask={selectedTask}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onReassign={handleReassign}
              onChangePriority={handleChangePriority}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
