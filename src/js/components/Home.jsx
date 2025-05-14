import React, { useState, useEffect } from 'react';
import "../../styles/index.css";

const API_BASE = 'https://playground.4geeks.com/todo';
const USER = 'sandrogomez';

const TodoList = () => {
	const [inputTask, setInputTask] = useState('');
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const userResponse = await fetch(`${API_BASE}/users/${USER}`);
				if (userResponse.status === 404) {
					await fetch(`${API_BASE}/users/${USER}`, { method: "POST" });
				}

				const tasksResponse = await fetch(`${API_BASE}/users/${USER}`);
				const data = await tasksResponse.json();
				setTasks(data.todos || []);
			} catch (err) {
				setError("Error al cargar datos");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const refreshTasks = async () => {
		const response = await fetch(`${API_BASE}/users/${USER}`);
		const data = await response.json();
		setTasks(data.todos || []);
	};

	const handleAdd = async () => {
		if (!inputTask.trim()) return;

		try {
			await fetch(`${API_BASE}/todos/${USER}`, {
				method: "POST",
				body: JSON.stringify({ label: inputTask, is_done: false }),
				headers: { "Content-Type": "application/json" }
			});
			setInputTask('');
			await refreshTasks();
		} catch (err) {
			setError("Error al agregar tarea");
			console.error(err);
		}
	};

	const handleDelete = async (id) => {
		try {
			await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
			await refreshTasks();
		} catch (err) {
			setError("Error al eliminar tarea");
			console.error(err);
		}
	};

	const handleToggle = async (id) => {
		try {
			const taskToUpdate = tasks.find(task => task.id === id);
			await fetch(`${API_BASE}/todos/${id}`, {
				method: "PUT",
				body: JSON.stringify({
					label: taskToUpdate.label,
					is_done: !taskToUpdate.is_done
				}),
				headers: { "Content-Type": "application/json" }
			});
			await refreshTasks();
		} catch (err) {
			setError("Error al actualizar tarea");
			console.error(err);
		}
	};

	const handleClearAll = async () => {
		if (!window.confirm("¿Estás seguro de eliminar todas las tareas?")) return;

		try {
			for (const task of tasks) {
				await fetch(`${API_BASE}/todos/${task.id}`, { method: "DELETE" });
			}
			setTasks([]);
		} catch (err) {
			setError("Error al limpiar tareas");
			console.error(err);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') handleAdd();
	};

	if (loading) return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-8 col-lg-6">
					<div className="card shadow custom-card">
						<div className="card-body p-4 text-center">
							<p>Cargando tus tareas...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	if (error) return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-8 col-lg-6">
					<div className="card shadow custom-card">
						<div className="card-body p-4 text-center text-danger">
							<p>{error}</p>
							<button className="btn btn-primary" onClick={refreshTasks}>
								Reintentar
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-8 col-lg-6">
					<div className="card shadow custom-card">
						<div className="card-body p-4">
							<h1 className="text-center mb-4 custom-title">Mis Tareas</h1>

							<div className="input-group mb-4">
								<input
									type="text"
									className="form-control form-control-lg custom-input"
									value={inputTask}
									onChange={(e) => setInputTask(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="¿Qué necesitas hacer?"
								/>
								<button
									className="btn custom-btn-add"
									onClick={handleAdd}
								>
									+
								</button>
							</div>

							<div className="task-list">
								{tasks.length === 0 ? (
									<div className="text-center text-muted py-4 empty-tasks">
										<p className="mb-1">No hay tareas pendientes</p>
										<small>Añade una nueva tarea para comenzar</small>
									</div>
								) : (
									tasks.map(task => (
										<div
											key={task.id}
											className={`task-item d-flex justify-content-between align-items-center p-3 mb-2 rounded ${task.is_done ? 'task-completed' : 'task-pending'
												}`}
										>
											<div className="d-flex align-items-center">
												<div
													className={`task-checkbox me-3 ${task.is_done ? 'checked' : ''}`}
													onClick={() => handleToggle(task.id)}
												>
													{task.is_done && <span>✓</span>}
												</div>
												<span className={task.is_done ? 'text-decoration-line-through' : ''}>
													{task.label}
												</span>
											</div>
											<button
												onClick={() => handleDelete(task.id)}
												className="btn btn-sm btn-delete"
												aria-label="Eliminar tarea"
											>
												×
											</button>
										</div>
									))
								)}
							</div>

							{tasks.length > 0 && (
								<div className="mt-3 d-flex justify-content-between align-items-center">
									<button
										onClick={handleClearAll}
										className="btn btn-sm btn-danger"
									>
										Limpiar todas
									</button>
									<span className="small text-muted">
										{tasks.filter(t => t.is_done).length} de {tasks.length} completadas
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TodoList;