$(document).ready(function () {

    /*
     * =========================================================
     * REUSABLE DISCUSSION COMMENTS
     * =========================================================
     *
     * This component is intentionally independent from
     * Socket.IO / Global Chat.
     *
     * Communication:
     *
     *   GET    -> load comments
     *   POST   -> create comment / reply
     *   DELETE -> delete own comment
     *
     * Everything is handled through jQuery AJAX.
     * No page reloads.
     */

    $("[data-discussion]").each(function () {

        initializeDiscussion($(this));

    });


    function initializeDiscussion($discussion) {

        // =====================================================
        // CONFIGURATION
        // =====================================================

        const listUrl =
            $discussion.data("list-url");

        const createUrl =
            $discussion.data("create-url");

        const deleteUrl =
            $discussion.data("delete-url");

        const currentUserId =
            String(
                $discussion.data("current-user-id")
            );


        // =====================================================
        // DOM ELEMENTS
        // =====================================================

        const $commentsList =
            $discussion.find("[data-comments-list]");

        const $input =
            $discussion.find("[data-comment-input]");

        const $submit =
            $discussion.find("[data-submit-comment]");

        const $submitText =
            $discussion.find("[data-submit-text]");

        const $replyBox =
            $discussion.find("[data-reply-box]");

        const $replyUser =
            $discussion.find("[data-reply-user]");

        const $replyContent =
            $discussion.find("[data-reply-content]");

        const $characterCount =
            $discussion.find("[data-character-count]");


        // =====================================================
        // STATE
        // =====================================================

        let replyToId = null;

        let commentsCache = {};


        // =====================================================
        // INITIALIZE
        // =====================================================

        loadComments();


        // =====================================================
        // LOAD COMMENTS
        // =====================================================

        function loadComments() {

            showLoadingState();

            $.ajax({

                url: listUrl,

                type: "GET",

                dataType: "json",

                cache: false,

                success: function (response) {

                    if (
                        !response ||
                        !response.success
                    ) {

                        showLoadError(
                            "Unable to load comments."
                        );

                        return;
                    }


                    const comments =
                        Array.isArray(
                            response.comments
                        )
                            ? response.comments
                            : [];


                    renderComments(
                        comments
                    );

                },

                error: function (xhr) {

                    console.error(
                        "Load comments error:",
                        xhr.responseText
                    );

                    showLoadError(
                        "Unable to load comments."
                    );

                }

            });

        }


        // =====================================================
        // RENDER ALL COMMENTS
        // =====================================================

        function renderComments(comments) {

            commentsCache = {};


            if (!comments.length) {

                showEmptyState();

                return;
            }


            $commentsList.empty();


            comments.forEach(function (comment) {

                cacheComment(comment);

                $commentsList.append(
                    buildCommentHtml(comment)
                );

            });

        }


        // =====================================================
        // CACHE COMMENT
        // =====================================================

        function cacheComment(comment) {

            commentsCache[
                String(comment.comment_id)
            ] = comment;

        }


        // =====================================================
        // BUILD COMMENT HTML
        // =====================================================

        function buildCommentHtml(comment) {

            const commentId =
                String(comment.comment_id);

            const userId =
                String(comment.user_id);


            const isOwnComment =
                userId === currentUserId;


            const fullName =
                comment.full_name ||
                "Unknown User";


            const content =
                comment.content ||
                "";


            const createdAt =
                formatDate(
                    comment.created_at
                );


            // -------------------------------------------------
            // AVATAR
            // -------------------------------------------------

            let avatarHtml;


            if (comment.profile_image) {

                avatarHtml = `
                    <img
                        src="${escapeHtml(
                            comment.profile_image
                        )}"
                        alt="${escapeHtml(
                            fullName
                        )}"
                    >
                `;

            } else {

                avatarHtml = `
                    <div class="discussion-avatar-placeholder">
                        <i class="fas fa-user"></i>
                    </div>
                `;

            }


            // -------------------------------------------------
            // YOU BADGE
            // -------------------------------------------------

            const youBadge =
                isOwnComment
                    ? `
                        <span class="discussion-you-badge">
                            You
                        </span>
                    `
                    : "";


            // -------------------------------------------------
            // REPLY PREVIEW
            // -------------------------------------------------

            let parentHtml = "";


            if (
                comment.reply_to_id &&
                comment.reply_content
            ) {

                parentHtml = `
                    <div class="discussion-parent">

                        <div class="discussion-parent-author">

                            <i class="fas fa-reply me-1"></i>

                            Replying to

                            <strong>
                                ${escapeHtml(
                                    comment.reply_user_name ||
                                    "User"
                                )}
                            </strong>

                        </div>

                        <div class="discussion-parent-content">

                            "${escapeHtml(
                                comment.reply_content
                            )}"

                        </div>

                    </div>
                `;

            }


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            const deleteHtml =
                isOwnComment
                    ? `
                        <button
                            type="button"
                            class="discussion-action-btn discussion-delete-btn"
                            data-delete-comment
                            data-comment-id="${commentId}"
                        >
                            <i class="fas fa-trash-alt me-1"></i>
                            Delete
                        </button>
                    `
                    : "";


            // -------------------------------------------------
            // COMPLETE COMMENT
            // -------------------------------------------------

            return `

                <article
                    class="discussion-comment"
                    data-comment-id="${commentId}"
                    data-comment-user-id="${userId}"
                >

                    <div class="d-flex gap-3">

                        <!-- Avatar -->

                        <div class="discussion-avatar flex-shrink-0">

                            ${avatarHtml}

                        </div>


                        <!-- Body -->

                        <div class="discussion-comment-body flex-grow-1">

                            <!-- Author -->

                            <div class="d-flex align-items-center flex-wrap">

                                <strong class="discussion-author">

                                    ${escapeHtml(
                                        fullName
                                    )}

                                </strong>

                                ${youBadge}

                                <span class="discussion-time">

                                    ${escapeHtml(
                                        createdAt
                                    )}

                                </span>

                            </div>


                            <!-- Parent -->

                            ${parentHtml}


                            <!-- Content -->

                            <div class="discussion-content">

                                ${escapeHtml(
                                    content
                                )}

                            </div>


                            <!-- Actions -->

                            <div class="discussion-actions">

                                <button
                                    type="button"
                                    class="discussion-action-btn"
                                    data-reply-comment
                                    data-comment-id="${commentId}"
                                >

                                    <i class="fas fa-reply me-1"></i>

                                    Reply

                                </button>


                                ${deleteHtml}

                            </div>

                        </div>

                    </div>

                </article>

            `;

        }


        // =====================================================
        // CHARACTER COUNTER
        // =====================================================

        $input.on(
            "input",
            function () {

                $characterCount.text(
                    $(this).val().length
                );

            }
        );


        // =====================================================
        // REPLY BUTTON
        // =====================================================

        $discussion.on(
            "click",
            "[data-reply-comment]",
            function () {

                const commentId =
                    String(
                        $(this).data(
                            "comment-id"
                        )
                    );


                const comment =
                    commentsCache[
                        commentId
                    ];


                if (!comment) {

                    showError(
                        "Unable to prepare reply."
                    );

                    return;
                }


                replyToId =
                    commentId;


                $replyUser.text(
                    comment.full_name ||
                    "User"
                );


                $replyContent.text(
                    `"${comment.content || ""}"`
                );


                $replyBox.removeClass(
                    "d-none"
                );


                $submitText.text(
                    "Post Reply"
                );


                $input
                    .attr(
                        "placeholder",
                        "Write your reply..."
                    )
                    .focus();


                // Scroll to composer.

                $input[0].scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );


        // =====================================================
        // CANCEL REPLY
        // =====================================================

        $discussion.on(
            "click",
            "[data-cancel-reply]",
            function () {

                cancelReply();

            }
        );


        function cancelReply() {

            replyToId = null;


            $replyBox.addClass(
                "d-none"
            );


            $replyUser.empty();

            $replyContent.empty();


            $submitText.text(
                "Post Comment"
            );


            $input.attr(
                "placeholder",
                "Write a comment..."
            );

        }


        // =====================================================
        // SUBMIT COMMENT
        // =====================================================

        $submit.on(
            "click",
            function () {

                submitComment();

            }
        );


        // =====================================================
        // CTRL + ENTER
        // =====================================================

        $input.on(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    submitComment();

                }

            }
        );


        function submitComment() {

            const content =
                $input
                    .val()
                    .trim();


            if (!content) {

                showWarning(
                    "Comment cannot be empty."
                );

                $input.focus();

                return;
            }


            setSubmitting(
                true
            );


            $.ajax({

                url: createUrl,

                type: "POST",

                contentType:
                    "application/json",

                dataType:
                    "json",

                data: JSON.stringify({

                    content: content,

                    replyToId:
                        replyToId || null

                }),

                success: function (
                    response
                ) {

                    if (
                        !response ||
                        !response.success ||
                        !response.comment
                    ) {

                        showError(
                            "Comment could not be added."
                        );

                        return;
                    }


                    const comment =
                        response.comment;


                    // Cache it.

                    cacheComment(
                        comment
                    );


                    // Remove empty state.

                    $commentsList
                        .find(
                            "[data-empty-state]"
                        )
                        .remove();


                    // Remove loading/error.

                    $commentsList
                        .find(
                            "[data-discussion-message]"
                        )
                        .remove();


                    // Append immediately.

                    const $newComment =
                        $(buildCommentHtml(
                            comment
                        ));


                    $commentsList.append(
                        $newComment
                    );


                    // Clear input.

                    $input.val("");

                    $characterCount.text(
                        "0"
                    );


                    // Reset reply mode.

                    cancelReply();


                    // Scroll to new comment.

                    $newComment[0]
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                },

                error: function (xhr) {

                    console.error(
                        "Create comment error:",
                        xhr.responseText
                    );


                    const message =
                        xhr.responseJSON &&
                        xhr.responseJSON.message

                            ? xhr.responseJSON.message

                            : "Failed to add comment.";


                    showError(
                        message
                    );

                },

                complete: function () {

                    setSubmitting(
                        false
                    );

                }

            });

        }


        // =====================================================
        // DELETE COMMENT
        // =====================================================

        $discussion.on(
            "click",
            "[data-delete-comment]",
            function () {

                const commentId =
                    String(
                        $(this).data(
                            "comment-id"
                        )
                    );


                const $comment =
                    $discussion.find(
                        `[data-comment-id="${commentId}"]`
                    );


                Swal.fire({

                    title:
                        "Delete comment?",

                    text:
                        "This action cannot be undone.",

                    icon:
                        "warning",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Delete",

                    cancelButtonText:
                        "Cancel"

                }).then(
                    function (result) {

                        if (
                            !result.isConfirmed
                        ) {
                            return;
                        }


                        deleteComment(
                            commentId,
                            $comment
                        );

                    }
                );

            }
        );


        function deleteComment(
            commentId,
            $comment
        ) {

            const url =
                deleteUrl.replace(
                    ":commentId",
                    encodeURIComponent(
                        commentId
                    )
                );


            $.ajax({

                url: url,

                type: "DELETE",

                dataType: "json",

                success: function (
                    response
                ) {

                    if (
                        !response ||
                        !response.success
                    ) {

                        showError(
                            "Failed to delete comment."
                        );

                        return;
                    }


                    delete commentsCache[
                        commentId
                    ];


                    $comment
                        .slideUp(
                            180,
                            function () {

                                $(this).remove();

                                showEmptyStateIfNeeded();

                            }
                        );

                },

                error: function (xhr) {

                    console.error(
                        "Delete comment error:",
                        xhr.responseText
                    );


                    const message =
                        xhr.responseJSON &&
                        xhr.responseJSON.message

                            ? xhr.responseJSON.message

                            : "Failed to delete comment.";


                    showError(
                        message
                    );

                }

            });

        }


        // =====================================================
        // EMPTY STATE
        // =====================================================

        function showEmptyStateIfNeeded() {

            const count =
                $commentsList.find(
                    "[data-comment-id]"
                ).length;


            if (count === 0) {

                showEmptyState();

            }

        }


        function showEmptyState() {

            $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-empty-state
                >

                    <div class="discussion-empty-icon">

                        <i class="far fa-comments"></i>

                    </div>

                    <h6>
                        No comments yet
                    </h6>

                    <p class="text-muted mb-0">
                        Start the discussion.
                    </p>

                </div>

            `);

        }


        // =====================================================
        // LOADING STATE
        // =====================================================

        function showLoadingState() {

            $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-discussion-message
                >

                    <div class="discussion-empty-icon">

                        <i class="fas fa-spinner fa-spin"></i>

                    </div>

                    <h6>
                        Loading comments...
                    </h6>

                </div>

            `);

        }


        // =====================================================
        // LOAD ERROR
        // =====================================================

        function showLoadError(
            message
        ) {

            $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-discussion-message
                >

                    <div class="discussion-empty-icon">

                        <i class="fas fa-exclamation-circle"></i>

                    </div>

                    <h6>
                        ${escapeHtml(message)}
                    </h6>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mt-2"
                        data-retry-comments
                    >
                        Try Again
                    </button>

                </div>

            `);

        }


        // =====================================================
        // RETRY
        // =====================================================

        $discussion.on(
            "click",
            "[data-retry-comments]",
            function () {

                loadComments();

            }
        );


        // =====================================================
        // SUBMITTING STATE
        // =====================================================

        function setSubmitting(
            submitting
        ) {

            $submit.prop(
                "disabled",
                submitting
            );


            if (submitting) {

                $submitText.text(
                    replyToId
                        ? "Posting Reply..."
                        : "Posting..."
                );


                $submit
                    .find("i")
                    .removeClass(
                        "fa-paper-plane"
                    )
                    .addClass(
                        "fa-spinner fa-spin"
                    );

            } else {

                $submitText.text(
                    replyToId
                        ? "Post Reply"
                        : "Post Comment"
                );


                $submit
                    .find("i")
                    .removeClass(
                        "fa-spinner fa-spin"
                    )
                    .addClass(
                        "fa-paper-plane"
                    );

            }

        }


        // =====================================================
        // DATE
        // =====================================================

        function formatDate(
            value
        ) {

            if (!value) {
                return "";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "";

            }


            return date.toLocaleString();

        }


        // =====================================================
        // HTML ESCAPING
        // =====================================================

        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        // =====================================================
        // WARNINGS
        // =====================================================

        function showWarning(
            message
        ) {

            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "warning",

                title: message,

                showConfirmButton: false,

                timer: 2200

            });

        }


        // =====================================================
        // ERRORS
        // =====================================================

        function showError(
            message
        ) {

            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "error",

                title: message,

                showConfirmButton: false,

                timer: 2500

            });

        }

    }

});