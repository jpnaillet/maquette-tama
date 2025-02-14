import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  ToggleButton,
  Stack,
  Chip,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { ListItemIcon } from '@mui/material';

const TASK_TYPES = [
  'Traitement type 1',
  'Traitement type 2',
  'Traitement type 3',
  'Traitement type 4',
  'Traitement type 5'
];

const TEAMS = Array.from({ length: 14 }, (_, i) => `Équipe ${i + 1}`);

const SPACES = [
  'Zone A',
  'Zone B',
  'Zone C',
  'Zone D',
  'Zone E'
];

const WORK_DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi'
];

const getWeekDates = (weekStart) => {
  const dates = {};
  const start = new Date(weekStart);

  WORK_DAYS.forEach((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    dates[day] = date.toISOString().split('T')[0];
  });

  return dates;
};

const formatWeekDisplay = (weekStart) => {
  if (!weekStart) return '';
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

const TaskPlanner = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [weekDates, setWeekDates] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Calculer le nombre d'équipes planifiées par jour pour la semaine sélectionnée
  // Obtenir les équipes déjà affectées pour le jour sélectionné
  const assignedTeams = useMemo(() => {
    if (!selectedWeek || !selectedDay) return new Set();
    
    return new Set(
      assignments
        .filter(a => a.week === selectedWeek && a.day === selectedDay)
        .map(a => a.team)
    );
  }, [assignments, selectedWeek, selectedDay]);

  const teamsPerDay = useMemo(() => {
    if (!selectedWeek) return {};

    const counts = {};
    WORK_DAYS.forEach(day => {
      const teamsForDay = new Set(
        assignments
          .filter(a => a.week === selectedWeek && a.day === day)
          .map(a => a.team)
      );
      counts[day] = teamsForDay.size;
    });
    return counts;
  }, [assignments, selectedWeek]);

  const handleWeekChange = (date) => {
    const selectedDate = new Date(date);
    // Ajuster au lundi de la semaine
    const dayOfWeek = selectedDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() + diff);

    const mondayStr = monday.toISOString().split('T')[0];
    setSelectedWeek(mondayStr);
    setWeekDates(getWeekDates(mondayStr));
    setSelectedDay('');
  };

  const handleSpaceToggle = (space) => {
    setSelectedSpaces(prev => {
      if (prev.includes(space)) {
        return prev.filter(s => s !== space);
      } else {
        return [...prev, space];
      }
    });
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setSelectedWeek(assignment.week);
    setSelectedDay(assignment.day);
    setSelectedTask(assignment.task);
    setSelectedTeam(assignment.team);
    setSelectedSpaces(assignment.spaces);
    setWeekDates(getWeekDates(assignment.week));
  };

  const resetForm = () => {
    setSelectedTask('');
    setSelectedTeam('');
    setSelectedSpaces([]);
    setSelectedDay('');
    setEditingId(null);
  };

  const handleAssignment = () => {
    if (selectedWeek && selectedDay && selectedTask && selectedTeam && selectedSpaces.length > 0) {
      if (editingId) {
        // Mode édition
        setAssignments(assignments.map(assignment => 
          assignment.id === editingId
            ? {
                ...assignment,
                week: selectedWeek,
                day: selectedDay,
                date: weekDates[selectedDay],
                task: selectedTask,
                team: selectedTeam,
                spaces: [...selectedSpaces]
              }
            : assignment
        ));
      } else {
        // Nouvelle affectation
        setAssignments([
          ...assignments,
          {
            id: Date.now(),
            week: selectedWeek,
            day: selectedDay,
            date: weekDates[selectedDay],
            task: selectedTask,
            team: selectedTeam,
            spaces: [...selectedSpaces]
          }
        ]);
      }
      resetForm();
    }
  };

  const handleDelete = (id, event) => {
    event.stopPropagation(); // Empêcher le déclenchement du handleEdit
    setAssignments(assignments.filter(assignment => assignment.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Formulaire d'affectation */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Nouvelle Affectation
          </Typography>

          <Stack spacing={3}>
            {/* Sélection de la semaine */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Semaine
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon />
                <TextField
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => handleWeekChange(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
              {selectedWeek && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Semaine du {formatWeekDisplay(selectedWeek)}
                </Typography>
              )}
            </Box>

            {/* Sélection du jour */}
            {selectedWeek && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Jour
                </Typography>
                <Grid container spacing={1}>
                  {WORK_DAYS.map(day => (
                    <Grid item xs={12/5} key={day}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          border: 1,
                          borderColor: selectedDay === day ? 'primary.main' : 
                                     teamsPerDay[day] > 0 ? 'success.main' : 'divider',
                          bgcolor: selectedDay === day ? 'primary.light' : 'background.paper',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => setSelectedDay(day)}
                      >
                        <Typography align="center">{day}</Typography>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <Chip
                            label={`${teamsPerDay[day] || 0} équipe${teamsPerDay[day] !== 1 ? 's' : ''}`}
                            size="small"
                            color={teamsPerDay[day] > 0 ? "success" : "default"}
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Sélection de l'équipe */}
            <FormControl fullWidth>
              <InputLabel>Équipe</InputLabel>
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                label="Équipe"
              >
                <MenuItem value="">
                  <em>Sélectionner une équipe</em>
                </MenuItem>
                {TEAMS.map(team => (
                  <MenuItem key={team} value={team}>
                    <ListItemIcon>
                      {assignedTeams.has(team) && <CheckIcon color="primary" />}
                    </ListItemIcon>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sélection du type de tâche */}
            <FormControl fullWidth>
              <InputLabel>Type de Tâche</InputLabel>
              <Select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                label="Type de Tâche"
              >
                <MenuItem value="">
                  <em>Sélectionner une tâche</em>
                </MenuItem>
                {TASK_TYPES.map(task => (
                  <MenuItem key={task} value={task}>{task}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sélection des espaces */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Espaces (sélection multiple)
              </Typography>
              <Grid container spacing={1}>
                {SPACES.map(space => (
                  <Grid item xs={6} key={space}>
                    <ToggleButton
                      value={space}
                      selected={selectedSpaces.includes(space)}
                      onChange={() => handleSpaceToggle(space)}
                      fullWidth
                    >
                      {space}
                    </ToggleButton>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button
              variant="contained"
              onClick={handleAssignment}
              disabled={!selectedWeek || !selectedDay || !selectedTask || !selectedTeam || selectedSpaces.length === 0}
              fullWidth
            >
              {editingId ? 'Modifier' : 'Affecter'}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Liste des affectations */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Affectations Planifiées
          </Typography>

          <Stack spacing={2}>
            {assignments.map(assignment => (
              <Paper
                key={assignment.id}
                variant="outlined"
                sx={{ 
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: editingId === assignment.id ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => handleEdit(assignment)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">
                      Semaine du {new Date(assignment.week).toLocaleDateString()}
                    </Typography>
                    <Typography color="text.secondary">
                      {assignment.day}
                    </Typography>
                    <Typography>{assignment.team}</Typography>
                    <Typography>{assignment.task}</Typography>
                    <Typography color="text.secondary">
                      Zones : {assignment.spaces.join(', ')}
                    </Typography>
                  </Stack>
                  <IconButton
                    onClick={(e) => handleDelete(assignment.id, e)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}

            {assignments.length === 0 && (
              <Typography color="text.secondary" align="center">
                Aucune affectation planifiée
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TaskPlanner;
