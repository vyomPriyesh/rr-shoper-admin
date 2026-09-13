import React, { useCallback, useEffect, useMemo, useState } from 'react'
import apiList from '../../config/apiList';
import { userState } from '../../context/UserContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';
import { useParams } from 'react-router-dom';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import StatusSection from '../../utils/StatusSection';
import { FiCalendar, FiCheckCircle, FiChevronDown, FiChevronUp, FiCornerUpLeft, FiMail, FiMessageCircle, FiPhone, FiSend, FiUser } from 'react-icons/fi';
import { displayDateTime, timeAgo } from '../../utils/DateDisplay';
import ImagesUploadUi from '../../utils/ImagesUploadUi';
import { socket } from '../../config/socket';
import UserAvatar from '../../utils/UserAvatar';
import InputField from '../../utils/InputField';
import { useToast } from '../../context/ToastContext';

const TicketDetails = () => {

    const { tickets } = apiList()
    const { showToast } = useToast();
    const { user, options } = userState()
    const queryClient = useQueryClient()
    const { id } = useParams();

    const [newComment, setNewComment] = useState('')
    const [replyTo, setReplyTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [isAddingReply, setIsAddingReply] = useState(false)


    const { data: ticketDetails = {}, isFetching: ticketDetailsFetching } = useQuery({
        queryKey: ['ticket-details', id],
        queryFn: () => api.get(tickets.getTicket(id)),
        enabled: !!user && !!id,
        select: ({ data }) => data.data.result
    });

    const { mutate: handleUpdateStatus } = useMutation({
        mutationFn: (status) => api.get(tickets?.updateTicketStatus(status, id)),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            queryClient.invalidateQueries({
                queryKey: ['ticket-details', id]
            })
        }
    })

    const {
        data: { data: comments = [] } = {},
        isLoading: isCommentsLoading
    } = useQuery({
        queryKey: ['ticket-comments', id],
        queryFn: () => api.post(tickets.comments(id), { page: 1, limit: 10 }),
        enabled: !!user && !!id,
        select: ({ data }) => data?.data?.result || []
    })

    useEffect(() => {
        if (!socket || !user?.token || !id) return;

        const refreshComments = () => {
            queryClient.invalidateQueries({
                queryKey: ['ticket-comments', id]
            })
        }

        socket.connect()
        socket.on("ticket:comment-added", refreshComments)
        socket.on("ticket:reply-added", refreshComments)
        socket.emit("ticket:join", {
            ticketId: id
        });

        return () => {
            socket.emit("ticket:leave", {
                ticketId: id
            });
            socket.off("ticket:comment-added", refreshComments);
            socket.off("ticket:reply-added", refreshComments);
        };
    }, [user?.token, id, queryClient]);

    const { values, customer, assign_user, status, createdAt } = useMemo(() => ticketDetails, [ticketDetails])

    const allDetails = useMemo(() => {
        return [
            ...(values?.input ?? []),
            ...(values?.select ?? []),
            ...(values?.number ?? []),
            ...(values?.textarea ?? []),
        ];
    }, [values]);

    const commentCount = useMemo(() => {

        const countComments = (items = []) => {
            return items.reduce((total, item) => {
                return total + 1 + countComments(item?.replies || [])
            }, 0)
        }

        return countComments(comments)

    }, [comments])

    const handleAddComment = () => {

        const comment = newComment.trim()

        if (!comment) {
            return
        }

        socket.emit("ticket:add-comment", { ticketId: id, comment })
        setNewComment('')
    }

    const handleAddReply = (parentId) => {

        const comment = replyText.trim()

        if (!comment || isAddingReply) {
            return
        }

        setIsAddingReply(true)
        socket.emit("ticket:add-reply", {
            ticketId: id,
            parentId,
            comment
        })
        setReplyText('')
        setReplyTo(null)
        setIsAddingReply(false)
    }

    const StatusInput = () => {
        return (id &&
            <div className="w-60">
                <InputField
                    type='drop-single-select'
                    placeholder='Select Status'
                    value={status}
                    onChange={(e) => handleUpdateStatus(e)}
                    options={options?.ticketStatuses}
                />
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-5'>
            <div className="bg-white p-5 rounded-lg">
                <PageTitleAddbtn title={'Ticket Details'} displayStatus={<StatusInput />} />
            </div>
            <div className="rounded-lg flex flex-col gap-5">
                <div className="flex flex-row gap-5">
                    <SummaryCard
                        label="Ticket Status"
                        value={options?.ticketStatuses?.find(list => list.value == status)?.label}
                        icon={<FiCheckCircle size={18} />}
                        iconClass="bg-blue-50 text-blue-600"
                    />
                    <SummaryCard
                        label="Created On"
                        value={displayDateTime(createdAt)}
                        icon={<FiCalendar size={18} />}
                        iconClass="bg-purple-50 text-purple-600"
                    />
                </div>
                <div className="flex flex-row gap-5">
                    <div className="w-2/3">
                        <SectionCard
                            title="Ticket Details"
                            subtitle="Information collected for this ticket"
                        >
                            {allDetails?.length > 0 ? (
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                    {allDetails?.map((list, i) => (
                                        <LabelValue index={i} key={i} {...list} />
                                    ))}
                                    {values?.upload?.map((item, i) => (
                                        <div className="col-span-2 flex flex-col gap-2" key={i}>
                                            <p className="mb-1.5 2xl:text-sm xl:text-xs font-medium text-gray-500 capitalize">
                                                {item?.name}
                                            </p>
                                            <ImagesUploadUi
                                                value={item?.value}
                                                multiple={Array.isArray(item?.value)}
                                                readOnly
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState text="No ticket details available" />
                            )}
                        </SectionCard>
                    </div>
                    <div className="w-1/3 flex flex-col gap-5">
                        <PersonCard
                            title="Customer"
                            person={customer}
                            fallbackName="Customer"
                        />
                        <PersonCard
                            title="Assigned To"
                            person={assign_user}
                            fallbackName="Sales Executive"
                            role="Sales Executive"
                        />
                    </div>
                </div>
                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

                    {/* Header */}

                    <div className="flex items-center gap-2">

                        <FiMessageCircle
                            size={19}
                            className="text-[#a6587e]"
                        />

                        <h2 className="text-base font-semibold text-gray-900 md:text-lg">
                            Comments
                        </h2>

                        <span className="rounded-full bg-[#f4e4ec] px-2 py-0.5 text-xs font-medium text-[#a6587e]">
                            {commentCount}
                        </span>

                    </div>
                    <div className="mt-5 flex gap-3">
                        <UserAvatar image={user?.image?.image} name={user?.name} />

                        <div className="min-w-0 flex-1">

                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={1}
                                // disabled={isAddingComment}
                                className="w-full resize-none border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-gray-900 outline-none transition focus:border-[#b4678c] disabled:opacity-50"
                            />


                            {newComment.trim() && (

                                <div className="mt-2 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        // disabled={isAddingComment}
                                        onClick={() => setNewComment('')}
                                        className="rounded-full px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-[#f4e4ec] hover:text-[#a6587e] disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        // disabled={isAddingComment}
                                        onClick={handleAddComment}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#b4678c] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#a6587e] disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <FiSend size={13} />
                                        Comment
                                        {/* {isAddingComment
                                            ? 'Posting...'
                                            : 'Comment'
                                        } */}

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>
                    <div className="mt-7">

                        {isCommentsLoading ? (

                            <div className="space-y-4">

                                {[1, 2, 3].map(item => (

                                    <div
                                        key={item}
                                        className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
                                    >

                                        <div className="flex gap-3">

                                            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />

                                            <div className="flex-1 space-y-2">

                                                <div className="h-3 w-32 rounded bg-gray-200" />

                                                <div className="h-3 w-3/4 rounded bg-gray-200" />

                                                <div className="h-3 w-1/2 rounded bg-gray-200" />

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : comments.length > 0 ? (

                            <div className="space-y-7">

                                {comments.map(comment => (

                                    <YoutubeComment
                                        key={comment?._id || comment?.id}
                                        comment={comment}
                                        replyTo={replyTo}
                                        setReplyTo={setReplyTo}
                                        replyText={replyText}
                                        setReplyText={setReplyText}
                                        addReply={handleAddReply}
                                        // handleLike={handleLike}
                                        // handleDislike={handleDislike}
                                        // isLikePending={isLiking}
                                        // isDislikePending={isDisliking}
                                        isReplyPending={isAddingReply}
                                    />

                                ))}

                            </div>

                        ) : (

                            <div className="py-10 text-center">

                                <FiMessageCircle
                                    size={28}
                                    className="mx-auto text-gray-300"
                                />

                                <p className="mt-2 text-sm text-gray-500">
                                    No comments yet
                                </p>

                            </div>

                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const YoutubeComment = ({
    comment,
    replyTo,
    setReplyTo,
    replyText,
    setReplyText,
    addReply,
    handleLike,
    handleDislike,
    isLikePending,
    isDislikePending,
    isReplyPending,
    isReply,
    level = 0
}) => {

    const [showReplies, setShowReplies] = useState(false)

    const commentId = comment?._id || comment?.id

    const replies = comment?.replies || []

    const replyCount = replies.length

    const userReaction = comment?.userReaction || null

    const likes = comment?.likes || 0

    const dislikes = comment?.dislikes || 0


    return (

        <div className={`relative ${isReply ? 'mt-3' : 'mt-4'}`}>

            {/* ==================================================================
                Comment Card
            ================================================================== */}

            <div className={`relative rounded-xl border bg-white p-3 shadow-sm transition sm:p-4 ${isReply ? 'border-[#ead2df]' : 'border-gray-200'} hover:border-[#e4c0d0]`}>

                {/* Mobile Reply Indicator */}

                {isReply && (

                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-[#b4678c] sm:hidden">

                        <FiCornerUpLeft size={11} />

                        Reply

                        {level > 1 ? ` · Level ${level}` : ''}

                    </div>

                )}


                <div className="flex gap-2.5 sm:gap-3">

                    {/* Avatar */}
                    <UserAvatar image={comment?.reply_by_customer?.image || comment?.reply_by_user?.image} name={comment?.reply_by_customer?.name || comment?.reply_by_user?.name} />

                    <div className="min-w-0 flex-1">

                        {/* User */}

                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">

                            <span className="max-w-[70%] truncate text-xs font-semibold text-gray-900 sm:max-w-none sm:text-sm">
                                {comment?.reply_by_customer?.name || comment?.reply_by_user?.name || 'Unknown User'}
                            </span>

                            <span className="text-[10px] text-gray-400 sm:text-xs">
                                {timeAgo(comment?.createdAt)}
                            </span>

                        </div>


                        {/* Comment Text */}

                        <p className="mt-2 break-words text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
                            {comment?.comment}
                        </p>


                        {/* ==================================================================
                            Actions
                        ================================================================== */}

                        <div className="mt-3 flex flex-wrap items-center gap-1">

                            {/* Like */}

                            {/* <button
                                type="button"
                                disabled={isLikePending || isDislikePending}
                                onClick={() => handleLike(commentId)}
                                className={`inline-flex min-h-[30px] items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium transition sm:px-3 sm:text-xs disabled:cursor-not-allowed disabled:opacity-50 ${userReaction === 'like' ? 'bg-[#f4e4ec] text-[#a6587e]' : 'text-gray-500 hover:bg-[#f4e4ec] hover:text-[#a6587e]'}`}
                            >

                                <FiThumbsUp
                                    size={13}
                                    className={userReaction === 'like' ? 'fill-[#a6587e]' : ''}
                                />

                                {likes}

                            </button> */}


                            {/* Dislike */}

                            {/* <button
                                type="button"
                                disabled={isLikePending || isDislikePending}
                                onClick={() => handleDislike(commentId)}
                                className={`inline-flex min-h-[30px] items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium transition sm:px-3 sm:text-xs disabled:cursor-not-allowed disabled:opacity-50 ${userReaction === 'dislike' ? 'bg-[#f4e4ec] text-[#a6587e]' : 'text-gray-500 hover:bg-[#f4e4ec] hover:text-[#a6587e]'}`}
                            >

                                <FiThumbsDown
                                    size={13}
                                    className={userReaction === 'dislike' ? 'fill-[#a6587e]' : ''}
                                />

                                {dislikes}

                            </button> */}


                            {/* Reply */}

                            <button
                                type="button"
                                onClick={() => {
                                    setReplyTo(commentId)
                                    setReplyText('')
                                }}
                                className="inline-flex min-h-[30px] items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium text-gray-500 transition hover:bg-[#f4e4ec] hover:text-[#a6587e] sm:px-3 sm:text-xs"
                            >

                                <FiCornerUpLeft size={13} />

                                Reply

                            </button>


                            {/* Show Replies */}

                            {replyCount > 0 && (

                                <button
                                    type="button"
                                    onClick={() => setShowReplies(prev => !prev)}
                                    className="inline-flex min-h-[30px] items-center gap-1 rounded-full bg-[#fdf8fa] px-2 py-1.5 text-[11px] font-medium text-[#a6587e] transition hover:bg-[#f4e4ec] sm:px-3 sm:text-xs"
                                >

                                    {showReplies ? (
                                        <FiChevronUp size={13} />
                                    ) : (
                                        <FiChevronDown size={13} />
                                    )}

                                    {replyCount}

                                    <span className="xs:inline">
                                        {replyCount === 1 ? ' Reply' : ' Replies'}
                                    </span>

                                </button>

                            )}

                        </div>


                        {/* ==================================================================
                            Reply Input
                        ================================================================== */}

                        {replyTo === commentId && (

                            <div className="mt-3 rounded-xl border border-[#ead2df] bg-[#fdf8fa] p-2.5 sm:mt-4 sm:p-3">

                                <div className="flex gap-2">

                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4e4ec] text-[10px] font-semibold text-[#a6587e] sm:h-8 sm:w-8 sm:text-xs">
                                        PB
                                    </div>


                                    <div className="min-w-0 flex-1">

                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Write a reply..."
                                            rows={2}
                                            autoFocus
                                            disabled={isReplyPending}
                                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-900 outline-none transition focus:border-[#b4678c] focus:ring-1 focus:ring-[#b4678c] sm:px-3 sm:text-sm"
                                        />


                                        <div className="mt-2 flex justify-end gap-1.5 sm:gap-2">

                                            <button
                                                type="button"
                                                disabled={isReplyPending}
                                                onClick={() => {
                                                    setReplyTo(null)
                                                    setReplyText('')
                                                }}
                                                className="rounded-full px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-[#f4e4ec] sm:px-4 sm:py-2 sm:text-xs"
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="button"
                                                disabled={!replyText.trim() || isReplyPending}
                                                onClick={() => addReply(commentId)}
                                                className="inline-flex items-center gap-1 rounded-full bg-[#b4678c] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#a6587e] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-xs"
                                            >

                                                <FiSend size={12} />

                                                {isReplyPending ? 'Sending...' : 'Reply'}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ==================================================================
                Replies

                IMPORTANT:
                On mobile there is NO increasing ml/pl per nesting level.

                Every nested level uses the same mobile rail.

                Desktop still gets normal indentation.
            ================================================================== */}

            {replyCount > 0 && showReplies && (

                <div className="relative mt-2 ml-2 pl-3 sm:ml-5 sm:pl-7">

                    {/* ==========================================================
                        Mobile Reply Rail
                    ========================================================== */}

                    <div className="absolute bottom-2 left-0 top-0 w-px bg-[#e4c0d0] sm:left-1 sm:w-px" />


                    {replies.map(reply => {

                        const replyId = reply?._id || reply?.id

                        return (

                            <div
                                key={replyId}
                                className="relative mb-2.5 last:mb-0 sm:mb-3"
                            >

                                {/* ==================================================
                                    Mobile Horizontal Connector
                                ================================================== */}

                                <div className="absolute -left-3 top-5 flex items-center sm:-left-7 sm:top-6">

                                    <div className="h-px w-3 bg-[#e4c0d0] sm:w-6" />

                                    <div className="absolute right-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-[#b4678c] sm:border-y-[4px] sm:border-l-[5px]" />

                                </div>


                                <YoutubeComment
                                    comment={reply}
                                    level={level + 1}
                                    replyTo={replyTo}
                                    setReplyTo={setReplyTo}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                    addReply={addReply}
                                    handleLike={handleLike}
                                    handleDislike={handleDislike}
                                    isLikePending={isLikePending}
                                    isDislikePending={isDislikePending}
                                    isReplyPending={isReplyPending}
                                />

                            </div>

                        )

                    })}

                </div>

            )}

        </div>

    )
}

const PersonCard = ({
    title,
    subtitle,
    person,
    fallbackName,
    image,
}) => {
    const isAssigned = !!person;

    const name =
        person?.name ||
        person?.full_name ||
        person?.first_name ||
        fallbackName;

    const email = person?.email;

    const phone =
        person?.phone ||
        person?.mobile ||
        person?.mobile_number;

    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                    {subtitle}
                </p>
            </div>

            {/* Body */}
            <div className="p-5">
                {!isAssigned ? (
                    /* =========================
                       NOT ASSIGNED
                    ========================== */
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-full bg-gray-100
                            text-gray-400"
                        >
                            <FiUser size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-700">
                                Unassigned
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                No user has been assigned yet
                            </p>
                        </div>
                    </div>
                ) : (
                    /* =========================
                       PERSON FOUND
                    ========================== */
                    <>
                        <div className="flex items-center gap-3">
                            <UserAvatar image={person?.image?.image} name={person?.name} />

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {name}
                                </p>

                                {person?.role && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {person.role}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        {(email || phone) && (
                            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                                {email && (
                                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                        <FiMail
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span className="truncate">
                                            {email}
                                        </span>
                                    </div>
                                )}

                                {phone && (
                                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                        <FiPhone
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span>{phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

const SectionCard = ({
    title,
    subtitle,
    children,
}) => {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white w-full h-full">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Body */}
            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const EmptyState = ({ text }) => {
    return (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">{text}</p>
        </div>
    );
};

const LabelValue = ({ index, name, value }) => {
    const renderValue = (value) => {
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="rounded-md bg-gray-100 px-2 py-1
                            2xl:text-sm xl:text-xs font-medium text-gray-700"
                        >
                            {typeof item === "object"
                                ? item?.name || item?.value || "-"
                                : item}
                        </span>
                    ))}
                </div>
            );
        } else {
            return value
        }
    }
    return (
        <div className="min-w-0" key={index}>
            <p className="mb-1.5 2xl:text-sm xl:text-xs font-medium text-gray-500 capitalize">
                {name}
            </p>

            <div className="break-words 2xl:text-sm xl:text-xs font-medium text-gray-900 capitalize">
                {renderValue(value)}
            </div>
        </div>
    )
}

const SummaryCard = ({
    label,
    value,
    icon,
    iconClass,
}) => {
    return (
        <div
            className="rounded-xl border border-gray-200 bg-white p-4 w-full
            transition hover:border-gray-300"
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-lg ${iconClass}`}
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                        {value || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails
