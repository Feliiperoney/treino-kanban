document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const addWorkoutBtn = document.getElementById('addWorkoutBtn');
    const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const workoutForm = document.getElementById('workoutForm');
    const addChecklistItemBtn = document.getElementById('addChecklistItem');
    const checklistContainer = document.getElementById('checklistContainer');
    const editWorkoutBtn = document.getElementById('editWorkoutBtn');
    
    // Modal elements
    const addWorkoutModal = new bootstrap.Modal(document.getElementById('addWorkoutModal'));
    const viewWorkoutModal = new bootstrap.Modal(document.getElementById('viewWorkoutModal'));
    
    // Listas de tarefas
    const pendenteList = document.getElementById('pendente-list');
    const andamentoList = document.getElementById('andamento-list');
    const concluidoList = document.getElementById('concluido-list');
    
    // Contadores
    const pendenteCount = document.getElementById('pendente-count');
    const andamentoCount = document.getElementById('andamento-count');
    const concluidoCount = document.getElementById('concluido-count');
    
    // Variáveis de estado
    let workouts = [];
    let editingWorkoutId = null;
    let draggedWorkout = null;
    
    // Carregar dados do localStorage
    loadWorkouts();
    
    // Atualizar contadores
    updateCounters();
    
    // Adicionar evento para o botão de salvar treino
    saveWorkoutBtn.addEventListener('click', saveWorkout);
    
    // Adicionar evento para o botão de limpar concluídos
    clearCompletedBtn.addEventListener('click', clearCompletedWorkouts);
    
    // Adicionar evento para o botão de adicionar item ao checklist
    addChecklistItemBtn.addEventListener('click', addChecklistItem);
    
    // Adicionar evento para o botão de editar no modal de visualização
    editWorkoutBtn.addEventListener('click', function() {
        viewWorkoutModal.hide();
        const workoutId = this.getAttribute('data-workout-id');
        if (workoutId) editWorkout(workoutId);
    });
    
    // Adicionar evento para fechar o modal e limpar o formulário
    document.getElementById('addWorkoutModal').addEventListener('hidden.bs.modal', function() {
        resetForm();
    });
    
    // Definir datas padrão
    setDefaultDates();
    
    // Função para carregar treinos do localStorage
    function loadWorkouts() {
        const savedWorkouts = localStorage.getItem('workoutKanban');
        if (savedWorkouts) {
            workouts = JSON.parse(savedWorkouts);
            renderWorkouts();
        } else {
            // Dados de exemplo para demonstração
            workouts = getSampleWorkouts();
            saveWorkoutsToStorage();
            renderWorkouts();
        }
    }
    
    // Função para obter treinos de exemplo
    function getSampleWorkouts() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return [
            {
                id: generateId(),
                name: "Treino de Peito e Tríceps",
                description: "Supino reto, supino inclinado, crucifixo, tríceps pulley",
                startDate: formatDateForInput(today.setHours(18, 0)),
                endDate: formatDateForInput(today.setHours(19, 30)),
                day: "segunda",
                status: "pendente",
                recurrence: 1,
                checklist: [
                    { text: "Supino reto 4x10", completed: false },
                    { text: "Supino inclinado 3x12", completed: false },
                    { text: "Crucifixo 3x15", completed: false },
                    { text: "Tríceps pulley 4x12", completed: false }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: "Treino de Costas e Bíceps",
                description: "Puxada frontal, remada curvada, rosca direta, rosca martelo",
                startDate: formatDateForInput(tomorrow.setHours(18, 0)),
                endDate: formatDateForInput(tomorrow.setHours(19, 30)),
                day: "terca",
                status: "andamento",
                recurrence: 1,
                checklist: [
                    { text: "Puxada frontal 4x10", completed: true },
                    { text: "Remada curvada 3x12", completed: true },
                    { text: "Rosca direta 3x15", completed: false },
                    { text: "Rosca martelo 4x12", completed: false }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: "Treino de Pernas",
                description: "Agachamento, leg press, extensora, flexora",
                startDate: formatDateForInput(nextWeek.setHours(18, 0)),
                endDate: formatDateForInput(nextWeek.setHours(19, 30)),
                day: "quarta",
                status: "concluido",
                recurrence: 1,
                checklist: [
                    { text: "Agachamento 4x10", completed: true },
                    { text: "Leg press 3x12", completed: true },
                    { text: "Extensora 3x15", completed: true },
                    { text: "Flexora 4x12", completed: true }
                ],
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    // Função para formatar data para input datetime-local
    function formatDateForInput(date) {
        const d = new Date(date);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    
    // Função para salvar treino
    function saveWorkout() {
        if (!workoutForm.checkValidity()) {
            workoutForm.reportValidity();
            return;
        }
        
        const workoutId = document.getElementById('workoutId').value;
        const checklistItems = document.querySelectorAll('.checklist-item');
        const checklist = [];
        
        checklistItems.forEach(item => {
            if (item.value.trim() !== '') {
                checklist.push({
                    text: item.value.trim(),
                    completed: false
                });
            }
        });
        
        const workoutData = {
            id: workoutId || generateId(),
            name: document.getElementById('workoutName').value,
            description: document.getElementById('workoutDescription').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            day: document.getElementById('workoutDay').value,
            status: 'pendente',
            recurrence: parseInt(document.getElementById('recurrence').value),
            checklist: checklist,
            createdAt: workoutId ? workouts.find(w => w.id === workoutId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (workoutId) {
            // Atualizar treino existente
            const index = workouts.findIndex(w => w.id === workoutId);
            if (index !== -1) {
                workouts[index] = workoutData;
            }
        } else {
            // Adicionar novo treino
            workouts.push(workoutData);
        }
        
        saveWorkoutsToStorage();
        renderWorkouts();
        updateCounters();
        addWorkoutModal.hide();
        resetForm();
    }
    
    // Função para editar treino
    function editWorkout(id) {
        const workout = workouts.find(w => w.id === id);
        if (!workout) return;
        
        editingWorkoutId = id;
        document.getElementById('workoutId').value = workout.id;
        document.getElementById('workoutName').value = workout.name;
        document.getElementById('workoutDescription').value = workout.description;
        document.getElementById('startDate').value = workout.startDate;
        document.getElementById('endDate').value = workout.endDate;
        document.getElementById('workoutDay').value = workout.day;
        document.getElementById('recurrence').value = workout.recurrence;
        
        // Limpar checklist atual
        checklistContainer.innerHTML = '';
        
        // Adicionar itens do checklist
        workout.checklist.forEach(item => {
            addChecklistItem(item.text);
        });
        
        // Adicionar um item em branco se não houver itens
        if (workout.checklist.length === 0) {
            addChecklistItem();
        }
        
        // Atualizar título do modal
        document.getElementById('addWorkoutModalLabel').textContent = 'Editar Treino';
        
        // Mostrar modal
        addWorkoutModal.show();
    }
    
    // Função para visualizar treino
    function viewWorkout(id) {
        const workout = workouts.find(w => w.id === id);
        if (!workout) return;
        
        const modalBody = document.getElementById('workoutDetails');
        const statusLabels = {
            'pendente': 'Pendente',
            'andamento': 'Em Andamento',
            'concluido': 'Concluído'
        };
        
        const dayLabels = {
            'segunda': 'Segunda-feira',
            'terca': 'Terça-feira',
            'quarta': 'Quarta-feira',
            'quinta': 'Quinta-feira',
            'sexta': 'Sexta-feira',
            'sabado': 'Sábado',
            'domingo': 'Domingo'
        };
        
        const recurrenceLabels = {
            0: 'Nenhuma',
            1: 'Semanal',
            2: 'Quinzenal'
        };
        
        let checklistHtml = '';
        if (workout.checklist && workout.checklist.length > 0) {
            checklistHtml = `
                <h6 class="mt-3">Checklist de Exercícios</h6>
                <div class="checklist-container">
                    ${workout.checklist.map((item, index) => `
                        <div class="form-check">
                            <input class="form-check-input workout-checklist-item" type="checkbox" 
                                   data-workout-id="${workout.id}" data-item-index="${index}" 
                                   ${item.completed ? 'checked' : ''} id="check-${workout.id}-${index}">
                            <label class="form-check-label ${item.completed ? 'text-decoration-line-through' : ''}" 
                                   for="check-${workout.id}-${index}">
                                ${item.text}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        modalBody.innerHTML = `
            <div class="workout-details">
                <h4>${workout.name}</h4>
                <p class="text-muted">${workout.description || 'Sem descrição'}</p>
                
                <div class="row mt-3">
                    <div class="col-md-6">
                        <p><strong>Status:</strong> <span class="badge bg-${workout.status}">${statusLabels[workout.status]}</span></p>
                        <p><strong>Dia da semana:</strong> ${dayLabels[workout.day]}</p>
                        <p><strong>Recorrência:</strong> ${recurrenceLabels[workout.recurrence]}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Início:</strong> ${formatDisplayDate(workout.startDate)}</p>
                        <p><strong>Término:</strong> ${formatDisplayDate(workout.endDate)}</p>
                        <p><strong>Criado em:</strong> ${formatDisplayDate(workout.createdAt)}</p>
                    </div>
                </div>
                
                ${checklistHtml}
            </div>
        `;
        
        // Configurar botão de editar
        editWorkoutBtn.setAttribute('data-workout-id', workout.id);
        
        // Adicionar eventos aos checkboxes do checklist
        document.querySelectorAll('.workout-checklist-item').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const workoutId = this.getAttribute('data-workout-id');
                const itemIndex = this.getAttribute('data-item-index');
                toggleChecklistItem(workoutId, itemIndex);
            });
        });
        
        viewWorkoutModal.show();
    }
    
    // Função para alternar item do checklist
    function toggleChecklistItem(workoutId, itemIndex) {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout || !workout.checklist || !workout.checklist[itemIndex]) return;
        
        workout.checklist[itemIndex].completed = !workout.checklist[itemIndex].completed;
        saveWorkoutsToStorage();
        
        // Se todos os itens estiverem concluídos, marcar o treino como concluído
        const allCompleted = workout.checklist.every(item => item.completed);
        if (allCompleted && workout.status !== 'concluido') {
            workout.status = 'concluido';
            saveWorkoutsToStorage();
            renderWorkouts();
            updateCounters();
        }
    }
    
    // Função para excluir treino
    function deleteWorkout(id) {
        if (confirm('Tem certeza que deseja excluir este treino?')) {
            workouts = workouts.filter(w => w.id !== id);
            saveWorkoutsToStorage();
            renderWorkouts();
            updateCounters();
        }
    }
    
    // Função para mover treino para outro status
    function moveWorkout(id, newStatus) {
        const workout = workouts.find(w => w.id === id);
        if (!workout) return;
        
        workout.status = newStatus;
        
        // Se o treino foi concluído e tem recorrência, criar uma cópia para a próxima semana
        if (newStatus === 'concluido' && workout.recurrence > 0) {
            createNextRecurrence(workout);
        }
        
        saveWorkoutsToStorage();
        renderWorkouts();
        updateCounters();
    }
    
    // Função para criar próxima recorrência
    function createNextRecurrence(workout) {
        const startDate = new Date(workout.startDate);
        const endDate = new Date(workout.endDate);
        
        // Adicionar dias conforme a recorrência
        const daysToAdd = workout.recurrence === 1 ? 7 : 14;
        startDate.setDate(startDate.getDate() + daysToAdd);
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        const newWorkout = {
            ...workout,
            id: generateId(),
            startDate: formatDateForInput(startDate),
            endDate: formatDateForInput(endDate),
            status: 'pendente',
            checklist: workout.checklist.map(item => ({
                ...item,
                completed: false
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        workouts.push(newWorkout);
    }
    
    // Função para limpar treinos concluídos
    function clearCompletedWorkouts() {
        if (confirm('Tem certeza que deseja remover todos os treinos concluídos?')) {
            workouts = workouts.filter(w => w.status !== 'concluido');
            saveWorkoutsToStorage();
            renderWorkouts();
            updateCounters();
        }
    }
    
    // Função para renderizar treinos
    function renderWorkouts() {
        // Limpar listas
        pendenteList.innerHTML = '';
        andamentoList.innerHTML = '';
        concluidoList.innerHTML = '';
        
        // Adicionar estado vazio se não houver treinos
        if (workouts.filter(w => w.status === 'pendente').length === 0) {
            pendenteList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>Nenhum treino pendente</p>
                </div>
            `;
        }
        
        if (workouts.filter(w => w.status === 'andamento').length === 0) {
            andamentoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-running"></i>
                    <p>Nenhum treino em andamento</p>
                </div>
            `;
        }
        
        if (workouts.filter(w => w.status === 'concluido').length === 0) {
            concluidoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Nenhum treino concluído</p>
                </div>
            `;
        }
        
        // Renderizar cada treino
        workouts.forEach(workout => {
            const taskCard = createTaskCard(workout);
            
            switch (workout.status) {
                case 'pendente':
                    pendenteList.appendChild(taskCard);
                    break;
                case 'andamento':
                    andamentoList.appendChild(taskCard);
                    break;
                case 'concluido':
                    concluidoList.appendChild(taskCard);
                    break;
            }
        });
        
        // Configurar arrastar e soltar
        setupDragAndDrop();
    }
    
    // Função para criar cartão de tarefa
    function createTaskCard(workout) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${workout.status}`;
        taskCard.setAttribute('data-workout-id', workout.id);
        taskCard.setAttribute('draggable', 'true');
        
        const completedCount = workout.checklist ? workout.checklist.filter(item => item.completed).length : 0;
        const totalCount = workout.checklist ? workout.checklist.length : 0;
        
        const dayLabels = {
            'segunda': 'Seg',
            'terca': 'Ter',
            'quarta': 'Qua',
            'quinta': 'Qui',
            'sexta': 'Sex',
            'sabado': 'Sáb',
            'domingo': 'Dom'
        };
        
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-title">${workout.name}</div>
                <div class="task-actions">
                    <button class="btn-action btn-view" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-date">
                <i class="far fa-calendar-alt"></i>
                ${formatDisplayDate(workout.startDate)} - ${formatDisplayTime(workout.startDate)}
            </div>
            <div class="task-description">${workout.description || ''}</div>
            ${workout.checklist && workout.checklist.length > 0 ? `
                <div class="task-checklist">
                    <div class="checklist-title">
                        <i class="fas fa-tasks"></i> Exercícios: ${completedCount}/${totalCount}
                    </div>
                    ${workout.checklist.slice(0, 2).map(item => `
                        <div class="checklist-item ${item.completed ? 'completed' : ''}">
                            <i class="fas fa-${item.completed ? 'check-square' : 'square'} fa-xs"></i>
                            ${item.text}
                        </div>
                    `).join('')}
                    ${workout.checklist.length > 2 ? `<div class="checklist-item">+${workout.checklist.length - 2} mais</div>` : ''}
                </div>
            ` : ''}
            <div class="task-tags">
                <span class="task-tag">${dayLabels[workout.day]}</span>
                ${workout.recurrence > 0 ? `<span class="task-tag"><i class="fas fa-redo"></i> Recorrente</span>` : ''}
            </div>
        `;
        
        // Adicionar eventos aos botões
        taskCard.querySelector('.btn-view').addEventListener('click', () => viewWorkout(workout.id));
        taskCard.querySelector('.btn-edit').addEventListener('click', () => editWorkout(workout.id));
        taskCard.querySelector('.btn-delete').addEventListener('click', () => deleteWorkout(workout.id));
        
        return taskCard;
    }
    
    // Função para configurar arrastar e soltar
    function setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.tasks-list');
        
        taskCards.forEach(task => {
            task.addEventListener('dragstart', function() {
                draggedWorkout = this;
                setTimeout(() => {
                    this.style.opacity = '0.4';
                }, 0);
            });
            
            task.addEventListener('dragend', function() {
                setTimeout(() => {
                    this.style.opacity = '1';
                    draggedWorkout = null;
                }, 0);
            });
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });
            
            column.addEventListener('dragleave', function() {
                this.style.backgroundColor = '';
            });
            
            column.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                
                if (draggedWorkout) {
                    const workoutId = draggedWorkout.getAttribute('data-workout-id');
                    const newStatus = this.getAttribute('data-status');
                    
                    moveWorkout(workoutId, newStatus);
                }
            });
        });
    }
    
    // Função para adicionar item ao checklist
    function addChecklistItem(text = '') {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
            <input type="text" class="form-control checklist-item" placeholder="Exercício (Ex: Supino reto)" value="${text}">
            <button type="button" class="btn btn-outline-danger remove-checklist-item"><i class="fas fa-minus"></i></button>
        `;
        
        checklistContainer.appendChild(div);
        
        // Adicionar evento para remover item
        div.querySelector('.remove-checklist-item').addEventListener('click', function() {
            div.remove();
        });
    }
    
    // Função para atualizar contadores
    function updateCounters() {
        const pendente = workouts.filter(w => w.status === 'pendente').length;
        const andamento = workouts.filter(w => w.status === 'andamento').length;
        const concluido = workouts.filter(w => w.status === 'concluido').length;
        
        pendenteCount.textContent = pendente;
        andamentoCount.textContent = andamento;
        concluidoCount.textContent = concluido;
    }
    
    // Função para salvar treinos no localStorage
    function saveWorkoutsToStorage() {
        localStorage.setItem('workoutKanban', JSON.stringify(workouts));
    }
    
    // Função para redefinir formulário
    function resetForm() {
        workoutForm.reset();
        document.getElementById('workoutId').value = '';
        document.getElementById('addWorkoutModalLabel').textContent = 'Adicionar Novo Treino';
        checklistContainer.innerHTML = '';
        addChecklistItem(); // Adicionar um item em branco
        setDefaultDates();
        editingWorkoutId = null;
    }
    
    // Função para definir datas padrão
    function setDefaultDates() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Definir data de início para amanhã às 18:00
        const startDate = new Date(tomorrow);
        startDate.setHours(18, 0, 0, 0);
        
        // Definir data de término para amanhã às 19:30
        const endDate = new Date(tomorrow);
        endDate.setHours(19, 30, 0, 0);
        
        document.getElementById('startDate').value = formatDateForInput(startDate);
        document.getElementById('endDate').value = formatDateForInput(endDate);
    }
    
    // Funções auxiliares
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function formatDisplayTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
});