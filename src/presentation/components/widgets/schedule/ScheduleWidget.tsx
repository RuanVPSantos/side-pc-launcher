import { useState, useEffect } from 'react';
import '../../../styles/schedule-widget.css';
import { useFocusDates, useProjects } from '../../../../services/hooks/useDatabaseSmart';

interface FocusDate {
    id: number;
    projectName: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'upcoming';
    description?: string;
    projectId?: number;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: FocusDate[];
}

export function ScheduleWidget() {
    const { focusDates: dbFocusDates, loading: focusLoading, createFocusDate, deleteFocusDate, updateFocusDate } = useFocusDates();
    const { projects, loading: projectsLoading } = useProjects();
    const [focusDates, setFocusDates] = useState<FocusDate[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<FocusDate | null>(null);
    const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; events: FocusDate[] }>({
        show: false,
        x: 0,
        y: 0,
        events: []
    });
    const [showEventSelector, setShowEventSelector] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState<FocusDate[]>([]);

    useEffect(() => {
        console.log('🔍 ScheduleWidget useEffect:', {
            focusLoading,
            projectsLoading,
            dbFocusDatesLength: dbFocusDates?.length,
            projectsLength: projects?.length
        });

        if (!focusLoading && !projectsLoading && dbFocusDates && projects) {
            console.log('📅 Dados do banco:', dbFocusDates);
            console.log('📁 Projetos:', projects);

            // Converter dados do banco para o formato do componente
            const convertedFocusDates: FocusDate[] = dbFocusDates.map((dbFocus: any) => {
                const project = projects.find((p: any) => p.id === dbFocus.projectId);

                // Determinar status baseado nas datas
                const now = new Date();
                const startDate = new Date(dbFocus.startDate);
                const endDate = new Date(dbFocus.endDate);

                let status: 'active' | 'completed' | 'upcoming' = 'upcoming';
                if (now >= startDate && now <= endDate) {
                    status = 'active';
                } else if (now > endDate) {
                    status = 'completed';
                }

                const converted = {
                    id: dbFocus.id,
                    projectName: project?.name || 'PROJETO DESCONHECIDO',
                    startDate: startDate,
                    endDate: endDate,
                    status: status,
                    description: project?.description || '',
                    projectId: dbFocus.projectId
                };

                console.log('🔄 Convertido:', converted);
                return converted;
            });

            console.log('✅ Focus dates convertidas:', convertedFocusDates);
            setFocusDates(convertedFocusDates);
        }
    }, [dbFocusDates, projects, focusLoading, projectsLoading]);

    const generateCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: CalendarDay[] = [];
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === today.toDateString();

            const events = focusDates.filter(event => {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);
                return date >= eventStart && date <= eventEnd;
            });

            days.push({
                date,
                isCurrentMonth,
                isToday,
                events
            });
        }

        return days;
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const handleDayClick = (day: CalendarDay) => {
        setSelectedDate(day.date);
        if (day.events.length === 0) {
            setEditingEvent(null);
            setShowEventForm(true);
        } else if (day.events.length === 1) {
            setEditingEvent(day.events[0]);
            setShowEventForm(true);
        } else {
            // Múltiplos eventos - mostrar seletor
            setShowEventSelector(true);
            setSelectedDayEvents(day.events);
        }
    };

    const handleEventClick = (event: FocusDate, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingEvent(event);
        setShowEventForm(true);
    };

    const handleSaveEvent = async (eventData: any) => {
        try {
            if (editingEvent) {
                // Editar evento existente
                console.log('✏️ Editando evento:', editingEvent.id);
                await updateFocusDate(editingEvent.id, {
                    projectId: eventData.projectId,
                    startDate: eventData.startDate.toISOString().split('T')[0],
                    endDate: eventData.endDate.toISOString().split('T')[0]
                });
                console.log('✅ Evento atualizado com sucesso!');
            } else {
                // Criar novo evento
                console.log('➕ Criando novo evento');
                if (eventData.projectId) {
                    await createFocusDate(
                        eventData.projectId,
                        eventData.startDate.toISOString().split('T')[0],
                        eventData.endDate.toISOString().split('T')[0]
                    );
                    console.log('✅ Evento criado com sucesso!');
                }
            }
            setShowEventForm(false);
            setEditingEvent(null);
            setSelectedDate(null);
        } catch (error) {
            console.error('❌ Erro ao salvar evento:', error);
            alert('Erro ao salvar evento. Tente novamente.');
        }
    };

    const handleDeleteEvent = async () => {
        if (editingEvent && confirm('Tem certeza que deseja deletar este evento?')) {
            try {
                console.log('🗑️ Deletando evento:', editingEvent.id);
                await deleteFocusDate(editingEvent.id);
                setShowEventForm(false);
                setEditingEvent(null);
                console.log('✅ Evento deletado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao deletar evento:', error);
                alert('Erro ao deletar evento. Tente novamente.');
            }
        }
    };

    const handleMouseEnter = (day: CalendarDay, e: React.MouseEvent) => {
        if (day.events.length > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
                show: true,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                events: day.events
            });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, show: false }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#00d9ff';
            case 'completed': return '#00ff00';
            case 'upcoming': return '#ff9500';
            default: return '#ffffff';
        }
    };

    const calendarDays = generateCalendarDays();
    const monthNames = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    if (focusLoading || projectsLoading) {
        return (
            <div className="widget schedule-widget">
                <div className="widget-header">
                    <h3 className="widget-title">CRONOGRAMA</h3>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', color: '#00d9ff' }}>
                    Carregando cronograma...
                </div>
            </div>
        );
    }

    return (
        <div className="widget schedule-widget">
            <div className="widget-header">
                <div className="calendar-header">
                    <button
                        className="nav-btn"
                        onClick={() => navigateMonth(-1)}
                    >
                        ‹
                    </button>
                    <h3 className="widget-title">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button
                        className="nav-btn"
                        onClick={() => navigateMonth(1)}
                    >
                        ›
                    </button>
                </div>
                <button
                    className="add-event-btn"
                    onClick={() => {
                        setSelectedDate(new Date());
                        setEditingEvent(null);
                        setShowEventForm(true);
                    }}
                >
                    + NOVO EVENTO
                </button>
            </div>

            <div className="calendar-content">
                <div className="calendar-grid">
                    <div className="calendar-days-header">
                        {dayNames.map(day => (
                            <div key={day} className="day-header">{day}</div>
                        ))}
                    </div>

                    <div className="calendar-days">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                                onClick={() => handleDayClick(day)}
                                onMouseEnter={(e) => handleMouseEnter(day, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="day-number">{day.date.getDate()}</div>
                                <div className="day-events">
                                    {day.events.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className={`event-dot ${event.status}`}
                                            style={{ backgroundColor: getStatusColor(event.status) }}
                                            onClick={(e) => handleEventClick(event, e)}
                                        />
                                    ))}
                                    {day.events.length > 2 && (
                                        <div className="more-events">+{day.events.length - 2}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showEventForm && (
                <div className="event-form-overlay">
                    <div className="event-form">
                        <div className="form-header">
                            <h4>{editingEvent ? 'EDITAR EVENTO' : 'NOVO EVENTO'}</h4>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowEventForm(false);
                                    setEditingEvent(null);
                                    setSelectedDate(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <EventForm
                            event={editingEvent}
                            selectedDate={selectedDate}
                            onSave={handleSaveEvent}
                            onDelete={editingEvent ? handleDeleteEvent : undefined}
                        />
                    </div>
                </div>
            )}

            {showEventSelector && (
                <div className="event-form-overlay">
                    <div className="event-selector">
                        <div className="form-header">
                            <h4>SELECIONAR EVENTO</h4>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowEventSelector(false);
                                    setSelectedDayEvents([]);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="event-selector-content">
                            <p>Este dia tem múltiplos eventos. Selecione qual deseja editar:</p>
                            <div className="event-list">
                                {selectedDayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="event-selector-item"
                                        onClick={() => {
                                            setEditingEvent(event);
                                            setShowEventForm(true);
                                            setShowEventSelector(false);
                                            setSelectedDayEvents([]);
                                        }}
                                    >
                                        <div
                                            className="event-selector-dot"
                                            style={{ backgroundColor: getStatusColor(event.status) }}
                                        />
                                        <div className="event-selector-info">
                                            <div className="event-selector-name">{event.projectName}</div>
                                            <div className="event-selector-status">
                                                {event.status === 'active' ? 'EM ANDAMENTO' :
                                                    event.status === 'completed' ? 'CONCLUÍDO' :
                                                        'PRÓXIMO'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="event-selector-actions">
                                <button
                                    className="primary-btn"
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setShowEventForm(true);
                                        setShowEventSelector(false);
                                        setSelectedDayEvents([]);
                                    }}
                                >
                                    CRIAR NOVO EVENTO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tooltip.show && (
                <div
                    className="calendar-tooltip"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                    }}
                >
                    <div className="tooltip-content">
                        <div className="tooltip-title">ATIVIDADES DO DIA</div>
                        {tooltip.events.map(event => (
                            <div key={event.id} className="tooltip-event">
                                <div
                                    className="tooltip-event-dot"
                                    style={{ backgroundColor: getStatusColor(event.status) }}
                                />
                                <div className="tooltip-event-info">
                                    <div className="tooltip-event-name">{event.projectName}</div>
                                    <div className="tooltip-event-status">{
                                        event.status === 'active' ? 'EM ANDAMENTO' :
                                            event.status === 'completed' ? 'CONCLUÍDO' :
                                                'PRÓXIMO'
                                    }</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface EventFormProps {
    event: FocusDate | null;
    selectedDate: Date | null;
    onSave: (data: any) => void;
    onDelete?: () => void;
}

function EventForm({ event, selectedDate, onSave, onDelete }: EventFormProps) {
    const { projects } = useProjects();
    const [formData, setFormData] = useState({
        projectId: event?.projectId || '',
        projectName: event?.projectName || '',
        description: event?.description || '',
        status: event?.status || 'upcoming',
        startDate: event?.startDate ? event.startDate.toISOString().split('T')[0] :
            selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        endDate: event?.endDate ? event.endDate.toISOString().split('T')[0] :
            selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            projectId: parseInt(formData.projectId as string),
            projectName: formData.projectName,
            description: formData.description,
            status: formData.status,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="event-form-content">
            <div className="form-group">
                <label>PROJETO</label>
                <select
                    value={formData.projectId}
                    onChange={(e) => {
                        const selectedProject = projects.find((p: any) => p.id === parseInt(e.target.value));
                        setFormData(prev => ({
                            ...prev,
                            projectId: e.target.value,
                            projectName: selectedProject?.name || ''
                        }));
                    }}
                    required
                >
                    <option value="">Selecione um projeto</option>
                    {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>DESCRIÇÃO</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>DATA INÍCIO</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>DATA FIM</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label>STATUS</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                    <option value="upcoming">PRÓXIMO</option>
                    <option value="active">EM ANDAMENTO</option>
                    <option value="completed">CONCLUÍDO</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn">
                    {event ? 'ATUALIZAR' : 'CRIAR'}
                </button>
                {onDelete && (
                    <button type="button" className="delete-event-btn" onClick={onDelete}>
                        DELETAR
                    </button>
                )}
            </div>
        </form>
    );
}
