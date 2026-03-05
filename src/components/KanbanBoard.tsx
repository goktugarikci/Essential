// src/components/KanbanBoard.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Başlangıç için örnek verilerimiz
const initialData = {
  lists: {
    'list-1': { id: 'list-1', title: '📝 Yapılacaklar', taskIds: ['task-1', 'task-2'] },
    'list-2': { id: 'list-2', title: '🔄 Devam Edenler', taskIds: ['task-3'] },
    'list-3': { id: 'list-3', title: '✅ Tamamlananlar', taskIds: ['task-4'] },
  },
  tasks: {
    'task-1': { id: 'task-1', content: 'Sürükle-Bırak kütüphanesinin kurulması' },
    'task-2': { id: 'task-2', content: 'LiveKit SFU sunucu kurulumları' },
    'task-3': { id: 'task-3', content: 'Tauri ve React arayüzlerinin yazılması' },
    'task-4': { id: 'task-4', content: 'C++ Backend REST API entegrasyonu' },
  },
  listOrder: ['list-1', 'list-2', 'list-3'],
};

const KanbanBoard: React.FC = () => {
  const [data, setData] = useState(initialData);

  // Sürükleme işlemi bittiğinde çalışacak fonksiyon
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Eğer kart panonun dışına bırakıldıysa veya yeri değişmediyse hiçbir şey yapma
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startList = data.lists[source.droppableId as keyof typeof data.lists];
    const finishList = data.lists[destination.droppableId as keyof typeof data.lists];

    // Aynı liste içinde sıralama değişiyorsa
    if (startList === finishList) {
      const newTaskIds = Array.from(startList.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newList = { ...startList, taskIds: newTaskIds };
      setData({ ...data, lists: { ...data.lists, [newList.id]: newList } });
      return;
    }

    // Farklı bir listeye taşınıyorsa
    const startTaskIds = Array.from(startList.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartList = { ...startList, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishList.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishList = { ...finishList, taskIds: finishTaskIds };

    setData({
      ...data,
      lists: {
        ...data.lists,
        [newStartList.id]: newStartList,
        [newFinishList.id]: newFinishList,
      },
    });

    // NOT: Gerçek projede burada C++ backend'inize bir API isteği atacaksınız.
    // Örnek: updateCardPosition(draggableId, destination.droppableId, destination.index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#313338' }}>
      {/* Üst Bar */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #1e1f22', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Geliştirme Panosu</span>
        </div>
      </div>

      {/* Sürükle Bırak Bağlamı */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ flexGrow: 1, padding: '20px', overflowX: 'auto', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          {data.listOrder.map((listId) => {
            const list = data.lists[listId as keyof typeof data.lists];
            const tasks = list.taskIds.map(taskId => data.tasks[taskId as keyof typeof data.tasks]);

            return (
              <div key={list.id} style={{ minWidth: '280px', width: '280px', backgroundColor: '#2b2d31', borderRadius: '8px', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                <div style={{ padding: '10px 15px', fontWeight: 'bold', color: '#fff' }}>
                  {list.title} ({tasks.length})
                </div>

                {/* Bırakılabilir Alan (Droppable) */}
                <Droppable droppableId={list.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      style={{ 
                        padding: '0 10px 10px 10px', 
                        display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100px',
                        backgroundColor: snapshot.isDraggingOver ? '#3f4147' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {tasks.map((task, index) => (
                        // Sürüklenebilir Kart (Draggable)
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                backgroundColor: snapshot.isDragging ? '#404249' : '#1e1f22',
                                padding: '12px', borderRadius: '6px', 
                                boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.2)',
                                ...provided.draggableProps.style
                              }}
                            >
                              <div style={{ color: '#dbdee1', fontSize: '14px', lineHeight: '1.4' }}>
                                {task.content}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <button style={{ backgroundColor: 'transparent', color: '#949ba4', border: 'none', textAlign: 'left', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>+</span> Kart Ekle
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;