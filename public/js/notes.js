// Read Modal Elements
// Modal Element States
const noteModalEl = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');

// Safely initialize Bootstrap modal if element exists
let noteModal;
if (noteModalEl) {
    noteModal = new bootstrap.Modal(noteModalEl);
}

function openCreateNoteModal() {
    document.getElementById('noteModalTitle').innerText = 'Create Note';
    document.getElementById('noteSubmitBtn').innerText = 'Save Note';
    noteForm.reset();
    document.getElementById('noteId').value = '';
}

function openEditNoteModal(note) {
    document.getElementById('noteModalTitle').innerText = 'Edit Note';
    document.getElementById('noteSubmitBtn').innerText = 'Update Note';
    
    document.getElementById('noteId').value = note.note_id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteDescription').value = note.description || '';
    document.getElementById('noteBody').value = note.body;
    document.getElementById('noteVisibility').checked = note.is_public;
    
    noteModal.show();
}

// Handle Form Submission (Create / Update)
if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const noteId = document.getElementById('noteId').value;
        const payload = {
            title: document.getElementById('noteTitle').value,
            description: document.getElementById('noteDescription').value,
            body: document.getElementById('noteBody').value,
            isPublic: document.getElementById('noteVisibility').checked
        };
        
        // Dynamically choose route based on whether an ID exists
        const url = noteId ? `/notes/${noteId}` : '/notes';
        const method = noteId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.success) {
                window.location.reload();
            } else {
                alert(result.message || 'Error saving note.');
            }
        } catch (error) {
            console.error('Notes Error:', error);
            alert('An error occurred while saving.');
        }
    });
}

// Handle Deletion
async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`/notes/${noteId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.message || 'Error deleting note.');
        }
    } catch (error) {
        console.error('Notes Error:', error);
        alert('An error occurred while deleting.');
    }
}

// Instant Client-Side Search
const searchInput = document.getElementById('noteSearch');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.note-item');
        
        items.forEach(item => {
            const textContent = item.innerText.toLowerCase();
            // Toggle visibility based on term match
            item.style.display = textContent.includes(term) ? 'block' : 'none';
        });
    });
}

const readNoteModalEl = document.getElementById('readNoteModal');
let readModal;
if (readNoteModalEl) {
    readModal = new bootstrap.Modal(readNoteModalEl);
}

function openReadModal(note) {
    // Populate Data
    document.getElementById('readNoteTitle').innerText = note.title;
    document.getElementById('readNoteDescription').innerText = note.description || '';
    document.getElementById('readNoteDescription').style.display = note.description ? 'block' : 'none';
    document.getElementById('readNoteContent').innerText = note.body;
    document.getElementById('readNoteAuthor').innerText = note.creator_name;
    document.getElementById('readNoteAvatar').innerText = note.creator_name.charAt(0);
    document.getElementById('readNoteDate').innerText = new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Handle Visibility Badge
    const badge = document.getElementById('readNoteVisibility');
    if (note.is_public) {
        badge.className = 'badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1';
        badge.innerHTML = '<i class="fas fa-globe me-1"></i> Public';
    } else {
        badge.className = 'badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1';
        badge.innerHTML = '<i class="fas fa-lock me-1"></i> Private';
    }

    readModal.show();
}