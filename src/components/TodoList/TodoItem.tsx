import React from 'react';
import { ListItem, ListItemText, IconButton, Checkbox, Divider, Typography } from '@mui/material';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';
import { format } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

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
              {todo.dueDate &&
                (() => {
                  const date = new Date(todo.dueDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dateOnly = new Date(date);
                  dateOnly.setHours(0, 0, 0, 0);
                  const isOverdue = dateOnly < today && !todo.completed;
                  const formatted = !isNaN(date.getTime()) ? format(date, 'PP') : null;
                  return formatted ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: isOverdue ? 'error.main' : 'text.secondary',
                        fontWeight: isOverdue ? 600 : 400,
                      }}
                      data-testid="due-date-text"
                    >
                      Due {formatted}
                    </Typography>
                  ) : null;
                })()}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};
