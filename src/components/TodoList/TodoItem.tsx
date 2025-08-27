import React from 'react';
import { ListItem, ListItemText, IconButton, Checkbox, Divider, Typography, Box, Chip } from '@mui/material';
import { format, isPast, parseISO } from 'date-fns';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  // Helper function to display due date and overdue status
  const getDueDateDisplay = (todo: Todo) => {
    if (!todo.dueDate) return null;
    
    const dueDate = parseISO(todo.dueDate);
    const isOverdue = isPast(dueDate) && !todo.completed;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Due: {format(dueDate, 'PP')}
        </Typography>
        {isOverdue && (
          <Chip 
            label="Overdue" 
            color="error" 
            size="small"
            data-testid="overdue-badge"
          />
        )}
      </Box>
    );
  };

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
                fontWeight: 500,
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                {todo.description}
              </Typography>
              {getDueDateDisplay(todo)}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};
