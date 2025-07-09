# Logic_Document

## Smart Assign Implementation

The Smart Assign feature is designed to automatically distribute tasks among team members in a fair and balanced way. When a user clicks the "Smart Assign" button on a task, the backend checks all users' current workloads by counting how many active tasks (those in "To Do" or "In Progress") each user has. The system then assigns the task to the user with the fewest active tasks. If there is a tie (multiple users have the same lowest number of active tasks), the system randomly selects one of them. This ensures that no single user is overloaded and that work is distributed as evenly as possible. Once assigned, the change is broadcast in real time to all connected users, so everyone sees the update instantly.

**Example:**
- User A has 2 active tasks, User B has 1, User C has 1.
- A new task is created and Smart Assign is used.
- The system randomly assigns the task to either User B or User C (since both have the fewest active tasks).

## Conflict Handling Implementation

Conflict handling ensures that when multiple users try to edit the same task at the same time, no one's changes are lost. Each task update includes a version or timestamp. When a user submits changes, the backend checks if the task has been modified since the user last loaded it. If it has, a conflict is detected.

When a conflict occurs, the frontend displays a modal dialog showing both the user's changes and the latest version from the server. The user can then choose to:
- Keep their own changes (overwriting the server version)
- Accept the server's version (discarding their changes)
- Manually merge the two versions before saving

**Example:**
- User A and User B both open Task X.
- User A changes the description and saves.
- User B (who still has the old version open) also tries to save a change.
- The backend detects the conflict and notifies User B.
- User B sees a modal with both versions and decides how to resolve the conflict.

This approach prevents accidental overwrites and ensures that all collaborators are aware of simultaneous edits, maintaining data integrity in a real-time collaborative environment.
