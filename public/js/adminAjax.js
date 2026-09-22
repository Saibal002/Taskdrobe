/* =========================================================
   TASKDROBE — ADMIN AJAX CONTROLLER
   Handles pure jQuery CRUD for Users and God-Mode Teams
========================================================= */

$(document).ready(function () {

    const $adminAlert =$("#adminAlert");
    const $userListContainer =$("#userListContainer");

    function showAdminAlert(message, type) {
        $adminAlert
            .removeClass("d-none alert-success alert-danger alert-warning")
            .addClass(`alert-${type}`)
            .html(`<strong>${message}</strong>`)
            .fadeIn();
        
        setTimeout(() => {
            $adminAlert.fadeOut(() =>$adminAlert.addClass("d-none"));
        }, 4000);
    }

    // ==========================================
    // 1. CLIENT-SIDE FILTERING & SORTING
    // ==========================================
    function applyFilters() {
        const role = $('#roleFilter').val();
        const sort = $('#sortFilter').val();
        let $items =$('.user-row-item'); 

        // 1. Filter by Role (Show/Hide)
        $items.each(function() {
            const itemRole = $(this).data('role');
            if (role === 'all' || itemRole === role) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // 2. Sort Items (Using the numeric ID from the row's ID attribute)
        let sortedItems = $items.get().sort((a, b) => {
            const idA = parseInt(a.id.replace('user-row-', ''), 10);
            const idB = parseInt(b.id.replace('user-row-', ''), 10);
            
            if (sort === 'oldest') {
                return idA - idB; // Ascending (Older IDs first)
            } else {
                return idB - idA; // Descending (Newer IDs first)
            }
        });

        // 3. Re-append in sorted order and update count badge
        $userListContainer.append(sortedItems);
        const visibleCount = $('.user-row-item:visible').length;
        $('#userCountBadge').text(visibleCount + ' Users');
    }

    $('#roleFilter, #sortFilter').on('change', applyFilters);


    // ==========================================
    // 2. PROVISION NEW USER
    // ==========================================
    const $createUserForm =$("#createUserForm");
    const $createUserBtn =$("#createUserBtn");
    const createUserModal = new bootstrap.Modal(document.getElementById('createUserModal'));

    $createUserForm.on("submit", function (e) {
        e.preventDefault();

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        const originalBtnText = $createUserBtn.html();$createUserBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span> Provisioning...');

        $.ajax({
            url: "/admin/users/create",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (res) {
                if (res.success) {
                    createUserModal.hide();
                    $createUserForm[0].reset();
                    showAdminAlert(res.message, "success");

                    const u = res.data;
                    const roleColor = u.role_name === 'admin' ? 'dark' : (u.role_name === 'manager' ? 'blue' : 'green');
                    const roleIcon = u.role_name === 'admin' ? 'fa-user-shield' : (u.role_name === 'manager' ? 'fa-user-tie' : 'fa-user');
                    
                    // Note the added 'user-row-item' class and 'data-role' attribute for filtering
                    const newUserHtml = `
                        <div class="admin-list-item user-row-item" id="user-row-${u.user_id}" data-role="${u.role_name.toLowerCase()}" style="display: none;">
                            <div class="admin-list-left">
                                <div class="admin-list-icon ${roleColor}">
                                    <i class="fas ${roleIcon}"></i>
                                </div>
                                <div>
                                    <span class="d-block mb-1 fw-bold">
                                        ${u.full_name}
                                        <span class="badge bg-success bg-opacity-10 text-success ms-2 px-2 py-1 rounded-pill" style="font-size: 0.65rem;">Active</span>
                                    </span>
                                    <small class="text-secondary">${u.email} · No phone</small>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-4">
                                <div class="admin-list-value ${roleColor} fs-6 text-uppercase tracking-wide">
                                    ${u.role_name}
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-light rounded-circle text-primary hover-lift edit-user-btn" 
                                        data-id="${u.user_id}" data-name="${u.full_name}" data-email="${u.email}" data-role="${u.role_name}" data-active="true" title="Edit User">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button class="btn btn-sm btn-light rounded-circle text-danger hover-lift delete-user-btn" data-id="${u.user_id}" title="Revoke Access">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

                    $userListContainer.find(".text-center.py-5").remove(); // Remove empty state
                    $userListContainer.prepend(newUserHtml);$(`#user-row-${u.user_id}`).fadeIn();
                    
                    applyFilters(); // Re-apply sorting/filtering immediately
                } else {
                    showAdminAlert(res.message, "danger");
                }
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || "A system error occurred while provisioning the user.";
                createUserModal.hide();
                showAdminAlert(errorMsg, "danger");
            },
            complete: function () {
                $createUserBtn.prop("disabled", false).html(originalBtnText);
            }
        });
    });

    // ==========================================
    // 3. DELETE USER
    // ==========================================
    $(document).on("click", ".delete-user-btn", function() {
        const userId = $(this).data("id");
        const $row =$(`#user-row-${userId}`);

        if(confirm("Are you sure you want to revoke access for this user? This cannot be undone.")) {
            const originalHtml = $(this).html();$(this).prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i>');

            $.ajax({
                url: `/admin/users/${userId}`,
                type: "DELETE",
                success: function (res) {
                    if (res.success) {
                        $row.fadeOut(300, function() {$(this).remove(); 
                            applyFilters(); // Update counts after deletion
                        });
                        showAdminAlert(res.message, "success");
                    } else {
                        showAdminAlert(res.message, "danger");
                        $(this).prop("disabled", false).html(originalHtml);
                    }
                },
                error: function (xhr) {
                    showAdminAlert("Failed to delete user.", "danger");
                    $(this).prop("disabled", false).html(originalHtml);
                }
            });
        }
    });

    // ==========================================
    // 4. EDIT USER
    // ==========================================
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const $editUserForm =$("#editUserForm");
    const $editUserBtn =$("#editUserBtn");

    $(document).on("click", ".edit-user-btn", function() {
        $("#editUserId").val($(this).data("id"));
        $("#editFullName").val($(this).data("name"));
        $("#editEmail").val($(this).data("email"));
        $("#editRoleName").val($(this).data("role"));
        $("#editIsActive").val(String($(this).data("active"))); 
        editUserModal.show();
    });

    $editUserForm.on("submit", function (e) {
        e.preventDefault();
        
        const userId = $("#editUserId").val();
        const formData = {
            fullName: $("#editFullName").val(),
            email: $("#editEmail").val(),
            roleName: $("#editRoleName").val(),
            isActive: $("#editIsActive").val() 
        };

        const originalBtnText = $editUserBtn.html();$editUserBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span> Saving...');

        $.ajax({
            url: `/admin/users/${userId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (res) {
                if (res.success) {
                    editUserModal.hide();
                    showAdminAlert(res.message, "success");

                    const u = res.data;
                    const roleColor = u.role_name === 'admin' ? 'dark' : (u.role_name === 'manager' ? 'blue' : 'green');
                    const roleIcon = u.role_name === 'admin' ? 'fa-user-shield' : (u.role_name === 'manager' ? 'fa-user-tie' : 'fa-user');
                    const $row =$(`#user-row-${userId}`);

                    const statusBadge = u.is_active 
                        ? `<span class="badge bg-success bg-opacity-10 text-success ms-2 px-2 py-1 rounded-pill" style="font-size: 0.65rem;">Active</span>`
                        : `<span class="badge bg-danger bg-opacity-10 text-danger ms-2 px-2 py-1 rounded-pill" style="font-size: 0.65rem;">Inactive</span>`;

                    // Update UI row
                    $row.attr("data-role", u.role_name.toLowerCase()); // Update role for filter
                    $row.find(".admin-list-icon").attr("class", `admin-list-icon ${roleColor}`);
                    if (!u.profile_image) {
                        $row.find(".admin-list-icon i").attr("class", `fas ${roleIcon}`);
                    }
                    $row.find(".d-block.mb-1").html(`${u.full_name} ${statusBadge}`);
                    $row.find("small.text-secondary").html(`${u.email} · Updated`);
                    $row.find(".admin-list-value").attr("class", `admin-list-value ${roleColor} fs-6 text-uppercase tracking-wide`).text(u.role_name);
                    
                    // Update button data attributes
                    $row.find(".edit-user-btn").data("name", u.full_name).data("email", u.email).data("role", u.role_name).data("active", u.is_active);
                    
                    applyFilters(); // Re-apply filters in case their role changed
                } else {
                    showAdminAlert(res.message, "danger");
                }
            },
            error: function () {
                showAdminAlert("Failed to update user.", "danger");
            },
            complete: function () {
                $editUserBtn.prop("disabled", false).html(originalBtnText);
            }
        });
    });
});