import { rest } from 'msw';

import { establishmentsData } from './establishments';
import { healthzStatusData } from './healthzStatus';
import { usersData } from './users';
import { EstablishmentsResponse } from '../types/establishment';

const baseUrl = import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL;

export const handlers = [
  rest.get(baseUrl + 'accounts/admins', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(usersData));
  }),
  rest.get(baseUrl + 'health/components-status', (req, res, ctx) => {
    return res(ctx.json(healthzStatusData));
  }),
  rest.post(baseUrl + 'attachments/add', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(baseUrl + 'configs/centops-establishments', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;

    console.log('WE GOOD BRO');

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = establishmentsData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(establishmentsData.length / pageSize);

    const response: EstablishmentsResponse = {
      response: {
        items: paginatedItems,
        page,
        pageSize,
        totalPages,
      },
    };

    return res(ctx.status(200), ctx.json(response));
  }),
];
