const meetingForm = document.getElementById('meetingForm');
const overlapAlert = document.getElementById('overlapAlert');

if (meetingForm) {
    meetingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const startInput = document.getElementById('meetingStart').value;
        const endInput = document.getElementById('meetingEnd').value;

        if (new Date(startInput) >= new Date(endInput)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Time',
                text: 'End time must be after the start time.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        const payload = {
            title: document.getElementById('meetingTitle').value,
            description: document.getElementById('meetingDescription').value,
            meetingLink: document.getElementById('meetingLink').value,
            startTime: new Date(startInput).toISOString(),
            endTime: new Date(endInput).toISOString()
        };

        try {
            const response = await fetch('/meetings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Forces global error handler to return JSON
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();

            if (!response.ok) {
                // Catches the 409 Conflict and any other AppErrors
                Swal.fire({
                    icon: 'error',
                    title: 'Scheduling Failed',
                    text: result.message || 'This time slot overlaps with an existing meeting.',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Scheduled!',
                    text: 'Meeting added to the workspace calendar.',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                });
            }
        } catch (error) {
            console.error('Meeting Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Something went wrong while communicating with the server.',
                confirmButtonColor: '#dc3545'
            });
        }
    });
}

async function deleteMeeting(meetingId) {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
        const response = await fetch(`/meetings/${meetingId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) window.location.reload();
    } catch (error) { console.error(error); }
}

// Socket.io Real-time Notifications Integration
if (typeof io !== 'undefined') {
    const socket = io();
    
    // Listen for new meeting scheduled globally
    socket.on('newMeetingScheduled', (data) => {
        // We can show a toast here. For now, reload if we are on the meetings page
        if (window.location.pathname === '/meetings') {
            // Optional: Auto-refresh or show an alert so they see the new schedule
            console.log("New meeting scheduled:", data);
        }
    });
    
    // Listen for the 15-minute early reminder
    socket.on('meetingReminder', (data) => {
        alert(`Reminder: Meeting "${data.title}" starts in 15 minutes!`);
    });
}