import {FC, PropsWithChildren, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useMutation} from '@tanstack/react-query';
import {ColumnPinningState, createColumnHelper, PaginationState, SortingState,} from '@tanstack/react-table';
import {format} from 'date-fns';
import {AxiosError} from 'axios';
import {MdOutlineRemoveRedEye} from 'react-icons/md';
import './DeletionChatOverview.scss';

import {Button, Card, DataTable, Dialog, Drawer, FormMultiselect, HistoricalChat, Icon, Tooltip,} from 'components';
import {Chat as ChatType, CHAT_EVENTS, CHAT_STATUS} from 'types/chat';
import {useToast} from 'hooks/useToast';
import {apiDev} from 'services/api';
import useStore from 'store';
import {getFromLocalStorage, setToLocalStorage,} from 'utils/local-storage-utils';
import {CHAT_HISTORY_PREFERENCES_KEY} from 'constants/config';
import {useLocation, useSearchParams} from 'react-router-dom';
import withAuthorization from 'hoc/with-authorization';
import {ROLES} from 'utils/constants';
import {et} from 'date-fns/locale';

type DeletionChatOverViewProps = {
    authDate: Date;
    anonDate: Date;
}

const ChatOverview: FC<PropsWithChildren<DeletionChatOverViewProps>> = ({authDate, anonDate}) => {
    const {t, i18n} = useTranslation();
    const toast = useToast();
    const userInfo = useStore((state) => state.userInfo);
    const routerLocation = useLocation();
    let passedChatId = new URLSearchParams(routerLocation.search).get('chat');
    const passedStartDate = format(authDate, 'yyyy-MM-dd');
    const passedEndDate = format(anonDate, 'yyyy-MM-dd');
    const preferences = getFromLocalStorage(
        CHAT_HISTORY_PREFERENCES_KEY
    ) as string[];
    const search = '';
    const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusChangeModal, setStatusChangeModal] = useState<string | null>(
        null
    );
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: searchParams.get('page')
            ? parseInt(searchParams.get('page') as string) - 1
            : 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const columnPinning: ColumnPinningState = {
        left: [],
        right: ['detail'],
    };
    const [totalPages, setTotalPages] = useState<number>(1);
    const [endedChatsList] = useState<ChatType[]>([]);
    const [filteredEndedChatsList, setFilteredEndedChatsList] = useState<
        ChatType[]
    >([]);

    const [messagesTrigger, setMessagesTrigger] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        preferences ?? []
    );

    const startDate = passedStartDate;
    const endDate = passedEndDate;

    useEffect(() => {
        if (passedChatId != null) {
            getChatById.mutate();
            passedChatId = null;
        }
    }, [passedChatId]);

    useEffect(() => {
        getAllEndedChats.mutate({
            startDate: format(authDate, 'yyyy-MM-dd'),
            endDate: format(anonDate, 'yyyy-MM-dd'),
            pagination,
            sorting,
            search,
        });
    }, [authDate, anonDate]);

    const getAllEndedChats = useMutation({
        mutationFn: (data: {
            startDate: string;
            endDate: string;
            pagination: PaginationState;
            sorting: SortingState;
            search: string;
        }) => {
            let sortBy = 'created desc';
            if (sorting.length > 0) {
                const sortType = sorting[0].desc ? 'desc' : 'asc';
                sortBy = `${sorting[0].id} ${sortType}`;
            }

            return apiDev.post('agents/chats/removable', {
                startDate: format(authDate, 'yyyy-MM-dd'),
                endDate: format(anonDate, 'yyyy-MM-dd'),
                page: pagination.pageIndex + 1,
                page_size: pagination.pageSize,
                sorting: sortBy,
                search,
            });
        },
        onSuccess: (res: any) => {
            filterChatsList(res.data.response ?? []);
            setTotalPages(res?.data?.response[0]?.totalPages ?? 1);
        },
    });

    const getChatById = useMutation({
        mutationFn: () =>
            apiDev.post('chats/get', {
                chatId: passedChatId,
            }),
        onSuccess: (res: any) => {
            setSelectedChat(res.data.response);
        },
    });

    const visibleColumnOptions = useMemo(
        () => [
            {label: t('chat.history.startTime'), value: 'created'},
            {label: t('chat.history.endTime'), value: 'ended'},
            {label: t('chat.history.csaName'), value: 'customerSupportDisplayName'},
            {label: t('global.name'), value: 'endUserName'},
            {label: t('global.idCode'), value: 'endUserId'},
            {label: t('chat.history.contact'), value: 'contactsMessage'},
            {label: t('chat.history.comment'), value: 'comment'},
            {label: t('chat.history.rating'), value: 'feedbackRating'},
            {label: t('chat.history.feedback'), value: 'feedbackText'},
            {label: t('global.status'), value: 'status'},
            {label: 'ID', value: 'id'},
        ],
        [t]
    );

    const chatStatusChangeMutation = useMutation({
        mutationFn: async (data: { chatId: string | number; event: string }) => {
            const changeableTo = [
                CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED.toUpperCase(),
                CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION.toUpperCase(),
                CHAT_EVENTS.ACCEPTED.toUpperCase(),
                CHAT_EVENTS.ANSWERED.toUpperCase(),
                CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS.toUpperCase(),
                CHAT_EVENTS.CLIENT_LEFT.toUpperCase(),
                CHAT_EVENTS.HATE_SPEECH.toUpperCase(),
                CHAT_EVENTS.OTHER.toUpperCase(),
                CHAT_EVENTS.TERMINATED.toUpperCase(),
                CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL.toUpperCase(),
            ];
            const isChangeable = changeableTo.includes(data.event);

            if (selectedChat?.lastMessageEvent === data.event.toLowerCase()) return;

            if (!isChangeable) return;

            await apiDev.post('chats/status', {
                chatId: selectedChat!.id,
                event: data.event.toUpperCase(),
                authorTimestamp: new Date().toISOString(),
                authorFirstName: userInfo!.firstName,
                authorId: userInfo!.idCode,
                authorRole: userInfo!.authorities,
            });
        },
        onSuccess: () => {
            setMessagesTrigger(!messagesTrigger);
            getAllEndedChats.mutate({
                startDate: format(new Date(startDate), 'yyyy-MM-dd'),
                endDate: format(new Date(endDate), 'yyyy-MM-dd'),
                pagination,
                sorting,
                search,
            });
            toast.open({
                type: 'success',
                title: t('global.notification'),
                message: t('toast.success.chatStatusChanged'),
            });
            setStatusChangeModal(null);
        },
        onError: (error: AxiosError) => {
            toast.open({
                type: 'error',
                title: t('global.notificationError'),
                message: error.message,
            });
        },
        onSettled: () => setStatusChangeModal(null),
    });

    const chatCommentChangeMutation = useMutation({
        mutationFn: (data: { chatId: string | number; comment: string }) =>
            apiDev.post('comments/history', data),
        onSuccess: (res, {chatId, comment}) => {
            const updatedChatList = endedChatsList.map((chat) =>
                chat.id === chatId ? {...chat, comment} : chat
            );
            filterChatsList(updatedChatList);
            if (selectedChat) setSelectedChat({...selectedChat, comment});
            toast.open({
                type: 'success',
                title: t('global.notification'),
                message: t('toast.success.chatCommentChanged'),
            });
        },
        onError: (error: AxiosError) => {
            toast.open({
                type: 'error',
                title: t('global.notificationError'),
                message: error.message,
            });
        },
    });

    const columnHelper = createColumnHelper<ChatType>();

    const copyValueToClipboard = async (value: string) => {
        await navigator.clipboard.writeText(value);

        toast.open({
            type: 'success',
            title: t('global.notification'),
            message: t('toast.success.copied'),
        });
    };

    const commentView = (props: any) =>
        props.getValue() && (
            <Tooltip content={props.getValue()}>
        <span
            onClick={() => copyValueToClipboard(props.getValue())}
            style={{cursor: 'pointer'}}
        >
          {props.getValue().length <= 30
              ? props.getValue()
              : `${props.getValue()?.slice(0, 30)}...`}
        </span>
            </Tooltip>
        );

    const feedbackTextView = (props: any) => {
        const value = props.getValue() ?? '';

        return (
            <Tooltip content={value}>
        <span style={{minWidth: '250px'}}>
          {value.length < 30 ? value : `${value?.slice?.(0, 30)}...`}
        </span>
            </Tooltip>
        );
    };

    const statusView = (props: any) => {
        const isLastMessageEvent =
            props.row.original.lastMessageEvent != null &&
            props.row.original.lastMessageEvent !== 'message-read'
                ? t('chat.plainEvents.' + props.row.original.lastMessageEvent)
                : t('chat.status.ended');
        return props.getValue() === CHAT_STATUS.ENDED ? isLastMessageEvent : '';
    };

    const idView = (props: any) => (
        <Tooltip content={props.getValue()}>
      <span
          onClick={() => copyValueToClipboard(props.getValue())}
          style={{cursor: 'pointer'}}
      >
        {props.getValue().split('-')[0]}
      </span>
        </Tooltip>
    );

    const detailsView = (props: any) => (
        <Button
            appearance="text"
            onClick={() => setSelectedChat(props.row.original)}
        >
            <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'}/>}/>
            {t('global.view')}
        </Button>
    );

    const endedChatsColumns = useMemo(
        () => [
            columnHelper.accessor('created', {
                id: 'created',
                header: t('chat.history.startTime') ?? '',
                cell: (props) =>
                    format(
                        new Date(props.getValue()),
                        'dd.MM.yyyy HH:mm:ss',
                        i18n.language === 'et' ? {locale: et} : undefined
                    ),
            }),
            columnHelper.accessor('ended', {
                id: 'ended',
                header: t('chat.history.endTime') ?? '',
                cell: (props) =>
                    format(
                        new Date(props.getValue()),
                        'dd.MM.yyyy HH:mm:ss',
                        i18n.language === 'et' ? {locale: et} : undefined
                    ),
            }),
            columnHelper.accessor('customerSupportDisplayName', {
                id: 'customerSupportDisplayName',
                header: t('chat.history.csaName') ?? '',
            }),
            columnHelper.accessor(
                (row) => `${row.endUserFirstName} ${row.endUserLastName}`,
                {
                    id: `endUserName`,
                    header: t('global.name') ?? '',
                }
            ),
            columnHelper.accessor('endUserId', {
                id: 'endUserId',
                header: t('global.idCode') ?? '',
            }),
            columnHelper.accessor('contactsMessage', {
                id: 'contactsMessage',
                header: t('chat.history.contact') ?? '',
                cell: (props) => (props.getValue() ? t('global.yes') : t('global.no')),
            }),
            columnHelper.accessor('comment', {
                id: 'comment',
                header: t('chat.history.comment') ?? '',
                cell: commentView,
            }),
            columnHelper.accessor('feedbackRating', {
                id: 'feedbackRating',
                header: t('chat.history.rating') ?? '',
                cell: (props) =>
                    props.getValue() && <span>{`${props.getValue()}/10`}</span>,
            }),
            columnHelper.accessor('feedbackText', {
                id: 'feedbackText',
                header: t('chat.history.feedback') ?? '',
                cell: feedbackTextView,
            }),
            columnHelper.accessor('status', {
                id: 'status',
                header: t('global.status') ?? '',
                cell: statusView,
                sortingFn: (a, b, isAsc) => {
                    const statusA =
                        a.getValue('status') === CHAT_STATUS.ENDED
                            ? t('chat.plainEvents.' + (a.original.lastMessageEvent ?? ''))
                            : '';
                    const statusB =
                        b.getValue('status') === CHAT_STATUS.ENDED
                            ? t('chat.plainEvents.' + (b.original.lastMessageEvent ?? ''))
                            : '';
                    return (
                        statusA.localeCompare(statusB, undefined, {
                            numeric: true,
                            sensitivity: 'base',
                        }) * (isAsc ? 1 : -1)
                    );
                },
            }),
            columnHelper.accessor('id', {
                id: 'id',
                header: 'ID',
                cell: idView,
            }),
            columnHelper.display({
                id: 'detail',
                cell: detailsView,
                meta: {
                    size: '2%'
                },
            }),
        ],
        []
    );

    const handleChatStatusChange = (event: string) => {
        if (!selectedChat) return;
        chatStatusChangeMutation.mutate({
            chatId: selectedChat.id,
            event: event.toUpperCase(),
        });
    };

    const handleCommentChange = (comment: string) => {
        if (!selectedChat) return;
        chatCommentChangeMutation.mutate({chatId: selectedChat.id, comment});
    };

    const getFilteredColumns = () => {
        if (selectedColumns.length === 0) return endedChatsColumns;
        return endedChatsColumns.filter((c) =>
            ['detail', 'forward', ...selectedColumns].includes(c.id ?? '')
        );
    };

    const filterChatsList = (chatsList: ChatType[]) => {
        setFilteredEndedChatsList(chatsList);
    };

    if (!filteredEndedChatsList) return <>Loading...</>;

    return (
        <div className={'full-width'}>
            <div className={'margin-auto'}>
                <FormMultiselect
                    name="visibleColumns"
                    label=''
                    options={visibleColumnOptions}
                    selectedOptions={visibleColumnOptions.filter((o) =>
                        selectedColumns.includes(o.value)
                    )}
                    onSelectionChange={(selection) => {
                        const columns = selection?.map((s) => s.value) ?? [];
                        setSelectedColumns(columns);
                        setToLocalStorage(CHAT_HISTORY_PREFERENCES_KEY, columns);
                    }}
                />
            </div>

            <DataTable
                data={filteredEndedChatsList}
                sortable
                columns={getFilteredColumns()}
                pagination={pagination}
                columnPinning={columnPinning}
                sorting={sorting}
                setPagination={(state: PaginationState) => {
                    if (
                        state.pageIndex === pagination.pageIndex &&
                        state.pageSize === pagination.pageSize
                    )
                        return;
                    setPagination(state);
                    getAllEndedChats.mutate({
                        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
                        endDate: format(new Date(endDate), 'yyyy-MM-dd'),
                        pagination: state,
                        sorting,
                        search,
                    });
                }}
                setSorting={(state: SortingState) => {
                    setSorting(state);
                    getAllEndedChats.mutate({
                        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
                        endDate: format(new Date(endDate), 'yyyy-MM-dd'),
                        pagination,
                        sorting: state,
                        search,
                    });
                }}
                isClientSide={false}
                pagesCount={totalPages}
            />

            {selectedChat && (
                <Drawer
                    title={
                        selectedChat.endUserFirstName !== '' &&
                        selectedChat.endUserLastName !== ''
                            ? `${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`
                            : t('global.anonymous')
                    }
                    onClose={() => setSelectedChat(null)}
                >
                    <HistoricalChat
                        chat={selectedChat}
                        trigger={messagesTrigger}
                        onChatStatusChange={setStatusChangeModal}
                        onCommentChange={handleCommentChange}
                    />
                </Drawer>
            )}

            {statusChangeModal && (
                <Dialog
                    title={t('chat.changeStatus')}
                    onClose={() => setStatusChangeModal(null)}
                    footer={
                        <>
                            <Button
                                appearance="secondary"
                                onClick={() => setStatusChangeModal(null)}
                            >
                                {t('global.cancel')}
                            </Button>
                            <Button
                                appearance="error"
                                onClick={() => handleChatStatusChange(statusChangeModal)}
                            >
                                {t('global.yes')}
                            </Button>
                        </>
                    }
                >
                    <p>{t('global.removeValidation')}</p>
                </Dialog>
            )}
        </div>
    );
};

export default withAuthorization(ChatOverview, [
    ROLES.ROLE_ADMINISTRATOR,
    ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);