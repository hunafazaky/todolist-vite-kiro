# Requirements Document

## Introduction

A simple, browser-based Todo List frontend application that allows users to manage their daily tasks. The application enables users to create, view, update, and delete tasks, as well as mark tasks as complete. The app runs entirely in the browser with no backend dependency, persisting data using the browser's local storage.

## Glossary

- **App**: The Todo List frontend application running in the browser.
- **Task**: A unit of work with a title, optional description, completion status, and creation timestamp.
- **Task_List**: The collection of all tasks managed by the App.
- **Task_Form**: The UI element used to create or edit a Task.
- **Filter**: A UI control that narrows the visible Task_List based on completion status.
- **Local_Storage**: The browser's built-in key-value persistence mechanism used to store tasks between sessions.

---

## Requirements

### Requirement 1: Create a Task

**User Story:** As a user, I want to add a new task with a title, so that I can track something I need to do.

#### Acceptance Criteria

1. THE App SHALL provide a Task_Form containing a text input field for the task title with a maximum length of 255 characters.
2. WHEN the user submits the Task_Form with a non-empty, non-whitespace-only title, THE App SHALL add a new Task to the Task_List with the trimmed title text, a default completion status of incomplete, and the current local date and time as the creation timestamp.
3. IF the user submits the Task_Form with an empty or whitespace-only title, THEN THE App SHALL display an inline validation error message adjacent to the title input field and SHALL NOT add a Task to the Task_List.
4. WHEN a new Task is successfully created, THE App SHALL clear the Task_Form input field and display the new Task at the top of the Task_List.
5. IF the task title exceeds 255 characters, THEN THE App SHALL display an inline validation error message adjacent to the title input field and SHALL NOT add a Task to the Task_List.

---

### Requirement 2: View Tasks

**User Story:** As a user, I want to see all my tasks listed on screen, so that I have a clear overview of what needs to be done.

#### Acceptance Criteria

1. THE App SHALL display all Tasks in the Task_List in reverse chronological order (most recently created first).
2. THE App SHALL display the title and a binary completion status indicator (completed or incomplete) for each Task.
3. WHILE the Task_List is empty, THE App SHALL display an empty-state message indicating there are no tasks.

---

### Requirement 3: Complete a Task

**User Story:** As a user, I want to mark a task as complete, so that I can track my progress.

#### Acceptance Criteria

1. THE App SHALL display a checkbox or toggle control alongside each Task in the Task_List.
2. WHEN the user activates the completion control for an incomplete Task, THE App SHALL update that Task's completion status to complete and apply strikethrough text on the Task title to indicate completion.
3. WHEN the user activates the completion control for a complete Task, THE App SHALL update that Task's completion status to incomplete and remove the strikethrough text from the Task title.
4. WHEN the user activates the completion control for any Task, THE App SHALL reflect the updated completion status in the UI immediately without a page reload.
5. IF updating the completion status fails, THEN THE App SHALL retain the Task's previous completion status and display an error message to the user.

---

### Requirement 4: Delete a Task

**User Story:** As a user, I want to remove a task, so that I can keep my list clean and relevant.

#### Acceptance Criteria

1. THE App SHALL display a delete control for each Task in the Task_List.
2. WHEN the user activates the delete control for a Task, THE App SHALL remove that Task from the Task_List and update the displayed list immediately, within 100 milliseconds.
3. IF the Task_List is empty after deletion, THEN THE App SHALL display an empty-state indicator in place of the Task_List.
4. WHEN the user activates the delete control for a Task, THE App SHALL require no additional confirmation before removing the Task.

---

### Requirement 5: Edit a Task Title

**User Story:** As a user, I want to edit the title of an existing task, so that I can correct mistakes or update task details.

#### Acceptance Criteria

1. THE App SHALL provide an edit control for each Task in the Task_List.
2. WHEN the user activates the edit control for a Task, THE App SHALL display the Task_Form pre-filled with the existing task title in an edit mode.
3. WHEN the user submits the Task_Form in edit mode with a non-empty, non-whitespace-only title, THE App SHALL update the Task's title (trimmed of leading/trailing whitespace), preserve the Task's completion status and creation timestamp, display the updated Task immediately, and exit edit mode.
4. IF the user submits the Task_Form in edit mode with an empty or whitespace-only title, THEN THE App SHALL display an inline validation error message and SHALL NOT update the Task, and SHALL retain edit mode so the user can correct the input.
5. WHEN the user cancels the Task_Form in edit mode, THE App SHALL discard all changes and exit edit mode without modifying the Task.
6. WHEN the user activates the edit control for a second Task while another Task is in edit mode, THE App SHALL discard any pending unsaved changes to the first Task and enter edit mode for the newly selected Task.

---

### Requirement 6: Filter Tasks

**User Story:** As a user, I want to filter tasks by their completion status, so that I can focus on what's still pending or review what I've finished.

#### Acceptance Criteria

1. THE App SHALL provide a Filter control with three options: "All", "Active" (incomplete), and "Completed", with "All" selected by default on initial load.
2. WHEN the user selects "All" from the Filter, THE App SHALL display all Tasks in the Task_List in reverse chronological order.
3. WHEN the user selects "Active" from the Filter, THE App SHALL display only Tasks with an incomplete completion status in reverse chronological order.
4. WHEN the user selects "Completed" from the Filter, THE App SHALL display only Tasks with a complete completion status in reverse chronological order.
5. WHILE a Filter option other than "All" is active and no Tasks match the filter criteria, THE App SHALL display an empty-state message indicating no tasks match the current filter.
6. WHEN a new Task is created while a Filter is active, THE App SHALL display the new Task in the filtered list only if the Task matches the active filter criteria.
7. WHEN the user toggles a Task's completion status while a Filter other than "All" is active, THE App SHALL immediately update the filtered list to reflect the Task's new status.

---

### Requirement 7: Persist Tasks Across Sessions

**User Story:** As a user, I want my tasks to be saved automatically, so that I don't lose my task list when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Task is created, updated, or deleted, THE App SHALL write the serialised Task_List to Local_Storage under a fixed storage key before the triggering operation's result is visible to the user.
2. WHEN the App initialises in the browser, THE App SHALL read the Task_List from Local_Storage and restore all previously saved Tasks within 500 milliseconds of page load.
3. IF no data exists in Local_Storage when the App initialises, THEN THE App SHALL initialise with an empty Task_List containing zero Tasks.
4. IF the data read from Local_Storage is malformed or cannot be parsed, THEN THE App SHALL discard the malformed data, initialise with an empty Task_List containing zero Tasks, and display an error message indicating that saved data could not be loaded.
5. IF a write to Local_Storage fails during Task creation, update, or deletion, THEN THE App SHALL display an error message indicating that the Task could not be saved and SHALL NOT alter the in-memory Task_List.
