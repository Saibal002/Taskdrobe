$(document).ready(function () {
    $('#meetingForm').on('submit', function (e) {
        e.preventDefault();

        const teamId = $('#meetingTeam').val();
        const startInput = $('#meetingStart').val();
        const endInput = $('#meetingEnd').val();

        if (!teamId) {
            Swal.fire('Missing Team', 'Please select a team for this meeting.', 'warning');
            return;
        }

        if (new Date(startInput) >= new Date(endInput)) {
            Swal.fire('Invalid Time', 'End time must be after the start time.', 'warning');
            return;
        }

        const payload = {
            teamId: teamId,
            title: $('#meetingTitle').val(),
            description: $('#meetingDescription').val(),
            meetingLink: $('#meetingLink').val(),
            startTime: new Date(startInput).toISOString(),
            endTime: new Date(endInput).toISOString()
        };

        $.ajax({
            url: '/meetings',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Accept': 'application/json' },
            dataType: 'json',
            data: JSON.stringify(payload),
            success: function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Scheduled!',
                        text: res.message || 'Team meeting scheduled.',
                        timer: 1400,
                        showConfirmButton: false
                    }).then(function () {
                        window.location.reload();
                    });
                }
            },
            error: function (xhr) {
                const errMsg = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'This team already has a meeting scheduled during this time slot.';

                Swal.fire({
                    icon: 'error',
                    title: 'Scheduling Conflict',
                    text: errMsg,
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    });

    $(document).on('click', '.btn-delete-meeting', function () {
        const meetingId = $(this).data('id');

        Swal.fire({
            title: 'Cancel Meeting?',
            text: 'This will permanently remove the meeting from the database.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it'
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/meetings/' + meetingId,
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' },
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            $('#meeting-row-' + meetingId).fadeOut(300, function () {
                                $(this).remove();
                            });
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: 'Meeting removed from database.',
                                timer: 1200,
                                showConfirmButton: false
                            });
                        }
                    },
                    error: function (xhr) {
                        const errMsg = xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'Failed to delete meeting from database.';
                        Swal.fire('Error', errMsg, 'error');
                    }
                });
            }
        });
    });
});