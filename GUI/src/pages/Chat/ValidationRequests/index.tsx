import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaginationState,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { Card, DataTable, Icon } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import ChatPending from '../ChatPending';

const ValidationRequests: React.FC = () => {
  const { t } = useTranslation();
//   const [triggers, setTriggers] = useState<Trigger[] | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

//   const loadConnectionRequests = (
//     pagination: PaginationState,
//     sorting: SortingState
//   ) => {
//     useServiceStore
//       .getState()
//       .loadRequestsList(
//         (requests: Trigger[]) => setTriggers(requests),
//         t('connectionRequests.toast.failed.requests'),
//         pagination,
//         sorting
//       );
//   };

  useEffect(() => {
    // loadConnectionRequests(pagination, sorting);
  }, []);

//   const respondToConnectionRequest = (status: boolean, request: Trigger) => {
//     useServiceStore
//       .getState()
//       .respondToConnectionRequest(
//         () => loadConnectionRequests(pagination, sorting),
//         t('connectionRequests.approvedConnection'),
//         t('connectionRequests.declinedConnection'),
//         status,
//         request
//       );
//   };

//   const appRequestColumns = useMemo(
//     () => getColumns(respondToConnectionRequest),
//     []
//   );

//   if (!triggers) return <span>Loading ...</span>;

  return (
    <>
      <h1>{t('connectionRequests.title')}</h1>
      <Card>
        {/* <DataTable
          data={[]}
          columns={appRequestColumns}
          sortable
          sorting={sorting}
          pagination={pagination}
          setPagination={(state: PaginationState) => {
            if (
              state.pageIndex === pagination.pageIndex &&
              state.pageSize === pagination.pageSize
            )
              return;
            setPagination(state);
            // loadConnectionRequests(state, sorting);
          }}
          setSorting={(state: SortingState) => {
            setSorting(state);
            // loadConnectionRequests(pagination, state);
          }}
          isClientSide={false}
        //   pagesCount={triggers[triggers.length - 1]?.totalPages ?? 1}
        /> */}
      </Card>
    </>
  );
};

// const getColumns = (
//   respondToConnectionRequest: (result: boolean, tigger: Trigger) => void
// ) => {
//   const appRequestColumnHelper = createColumnHelper<Trigger>();

//   return [
//     appRequestColumnHelper.accessor('intent', {
//       header: 'Intent',
//       cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
//     }),
//     appRequestColumnHelper.accessor('serviceName', {
//       header: 'Service',
//       cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
//     }),
//     appRequestColumnHelper.accessor('requestedAt', {
//       header: 'Requested At',
//       cell: (props) => (
//         <span>{format(new Date(props.getValue()), 'dd-MM-yyyy HH:mm:ss')}</span>
//       ),
//     }),
//     appRequestColumnHelper.display({
//       header: '',
//       cell: (props) => (
//         <Icon
//           icon={
//             <AiFillCheckCircle
//               fontSize={22}
//               color="rgba(34,139,34, 1)"
//               onClick={() =>
//                 respondToConnectionRequest(true, props.row.original)
//               }
//             />
//           }
//           size="medium"
//         />
//       ),
//       id: 'approve',
//       meta: {
//         size: '1%',
//       },
//     }),
//     appRequestColumnHelper.display({
//       header: '',
//       cell: (props) => (
//         <Icon
//           icon={
//             <AiFillCloseCircle
//               fontSize={22}
//               color="rgba(210, 4, 45, 1)"
//               onClick={() =>
//                 respondToConnectionRequest(false, props.row.original)
//               }
//             />
//           }
//           size="medium"
//         />
//       ),
//       id: 'reject',
//       meta: {
//         size: '1%',
//       },
//     }),
//     appRequestColumnHelper.display({
//       header: '',
//       id: 'space',
//       meta: {
//         size: '1%',
//       },
//     }),
//   ];
// };

export default withAuthorization(ValidationRequests, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);
