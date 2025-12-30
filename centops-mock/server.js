#!/usr/bin/env node

// Mock server for CentOps integration clients endpoint
// Using this instead of mocking in front-end, since MSW does not work with GUI

const http = require('node:http');
const url = require('node:url');

const port = 8090;
const endpoint = '/centops/integration/clients';

// Mock establishments data
const establishmentsData = [
  {
    clientId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Ministry of Finance',
    authenticationCertificate: 'cert-finance-2024',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-06-20T14:45:00Z',
  },
  {
    clientId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    name: 'Ministry of Education',
    authenticationCertificate: 'cert-education-2024',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-07-15T11:20:00Z',
  },
  {
    clientId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    name: 'Ministry of Health',
    authenticationCertificate: 'cert-health-2024',
    createdAt: '2024-03-05T13:45:00Z',
    updatedAt: null,
  },
  {
    clientId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    name: 'Ministry of Interior',
    authenticationCertificate: 'cert-interior-2024',
    createdAt: '2024-04-12T08:00:00Z',
    updatedAt: '2024-08-01T16:30:00Z',
  },
  {
    clientId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    name: 'Ministry of Justice',
    authenticationCertificate: 'cert-justice-2024',
    createdAt: '2024-05-20T12:00:00Z',
    updatedAt: null,
  },
  {
    clientId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    name: 'Tax and Customs Board',
    authenticationCertificate: 'cert-tax-2024',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-09-10T15:00:00Z',
  },
  {
    clientId: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
    name: 'Police and Border Guard',
    authenticationCertificate: 'cert-police-2024',
    createdAt: '2024-07-15T14:30:00Z',
    updatedAt: null,
  },
  {
    clientId: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
    name: 'Social Insurance Board',
    authenticationCertificate: 'cert-social-2024',
    createdAt: '2024-08-01T09:45:00Z',
    updatedAt: '2024-10-05T13:15:00Z',
  },
  {
    clientId: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
    name: 'Unemployment Insurance Fund',
    authenticationCertificate: 'cert-unemployment-2024',
    createdAt: '2024-09-10T11:00:00Z',
    updatedAt: null,
  },
  {
    clientId: 'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a',
    name: 'Health Insurance Fund',
    authenticationCertificate: 'cert-healthins-2024',
    createdAt: '2024-10-05T15:20:00Z',
    updatedAt: '2024-11-12T10:30:00Z',
  },
  {
    clientId: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    name: 'Environmental Board',
    authenticationCertificate: 'cert-environment-2024',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-05-15T09:30:00Z',
  },
  {
    clientId: 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
    name: 'Road Administration',
    authenticationCertificate: 'cert-road-2024',
    createdAt: '2024-02-25T14:15:00Z',
    updatedAt: null,
  },
  {
    clientId: 'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d',
    name: 'Consumer Protection Board',
    authenticationCertificate: 'cert-consumer-2024',
    createdAt: '2024-03-10T10:45:00Z',
    updatedAt: '2024-08-20T16:00:00Z',
  },
  {
    clientId: 'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e',
    name: 'Competition Authority',
    authenticationCertificate: 'cert-competition-2024',
    createdAt: '2024-04-05T13:20:00Z',
    updatedAt: null,
  },
  {
    clientId: 'c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f',
    name: 'Data Protection Inspectorate',
    authenticationCertificate: 'cert-dataprotection-2024',
    createdAt: '2024-05-12T08:30:00Z',
    updatedAt: '2024-09-25T14:45:00Z',
  },
  {
    clientId: 'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a',
    name: 'Estonian Rescue Board',
    authenticationCertificate: 'cert-rescue-2024',
    createdAt: '2024-06-08T12:15:00Z',
    updatedAt: null,
  },
  {
    clientId: 'e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b',
    name: 'National Heritage Board',
    authenticationCertificate: 'cert-heritage-2024',
    createdAt: '2024-07-03T09:00:00Z',
    updatedAt: '2024-11-01T11:30:00Z',
  },
  {
    clientId: 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c',
    name: 'Agricultural Registers and Information Board',
    authenticationCertificate: 'cert-agriculture-2024',
    createdAt: '2024-08-15T15:45:00Z',
    updatedAt: null,
  },
  {
    clientId: 'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d',
    name: 'Veterinary and Food Board',
    authenticationCertificate: 'cert-veterinary-2024',
    createdAt: '2024-09-20T10:20:00Z',
    updatedAt: '2024-12-05T13:00:00Z',
  },
  {
    clientId: 'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e',
    name: 'Technical Regulatory Authority',
    authenticationCertificate: 'cert-technical-2024',
    createdAt: '2024-10-10T11:30:00Z',
    updatedAt: null,
  },
  {
    clientId: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
    name: 'Statistics Estonia',
    authenticationCertificate: 'cert-statistics-2024',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-06-30T10:15:00Z',
  },
  {
    clientId: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a',
    name: 'National Archives of Estonia',
    authenticationCertificate: 'cert-archives-2024',
    createdAt: '2024-02-18T09:45:00Z',
    updatedAt: null,
  },
  {
    clientId: 'e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b',
    name: 'Estonian Land Board',
    authenticationCertificate: 'cert-land-2024',
    createdAt: '2024-03-22T13:10:00Z',
    updatedAt: '2024-07-28T15:45:00Z',
  },
  {
    clientId: 'f4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c',
    name: 'State Forest Management Centre',
    authenticationCertificate: 'cert-forest-2024',
    createdAt: '2024-04-17T08:25:00Z',
    updatedAt: null,
  },
  {
    clientId: 'a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d',
    name: 'Work Safety Inspectorate',
    authenticationCertificate: 'cert-worksafety-2024',
    createdAt: '2024-05-28T12:40:00Z',
    updatedAt: '2024-10-15T09:20:00Z',
  },
  {
    clientId: 'b6c7d8e9-f0a1-4b2c-3d4e-5f6a7b8c9d0e',
    name: 'State Support Centre',
    authenticationCertificate: 'cert-statesupport-2024',
    createdAt: '2024-06-14T10:55:00Z',
    updatedAt: null,
  },
  {
    clientId: 'c7d8e9f0-a1b2-4c3d-4e5f-6a7b8c9d0e1f',
    name: 'Information System Authority',
    authenticationCertificate: 'cert-infosystem-2024',
    createdAt: '2024-07-09T14:30:00Z',
    updatedAt: '2024-11-22T11:45:00Z',
  },
  {
    clientId: 'd8e9f0a1-b2c3-4d4e-5f6a-7b8c9d0e1f2a',
    name: 'Estonian Patent Office',
    authenticationCertificate: 'cert-patent-2024',
    createdAt: '2024-08-23T09:15:00Z',
    updatedAt: null,
  },
  {
    clientId: 'e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b',
    name: 'Language Inspectorate',
    authenticationCertificate: 'cert-language-2024',
    createdAt: '2024-09-16T15:20:00Z',
    updatedAt: '2024-12-01T13:30:00Z',
  },
  {
    clientId: 'f0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c',
    name: 'National Audit Office',
    authenticationCertificate: 'cert-audit-2024',
    createdAt: '2024-10-21T11:05:00Z',
    updatedAt: null,
  },
];

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle the establishments endpoint
  if (pathname === endpoint && req.method === 'GET') {
    const page = Number.parseInt(parsedUrl.query.page) || 1;
    const pageSize = Number.parseInt(parsedUrl.query.pageSize) || 10;

    console.log(`[${new Date().toISOString()}] GET ${pathname} - page: ${page}, pageSize: ${pageSize}`);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = establishmentsData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(establishmentsData.length / pageSize);

    const response = {
      response: {
        items: paginatedItems,
        page,
        pageSize,
        totalPages,
      },
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } else {
    // Handle 404
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} - 404 Not Found`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(port, () => {
  console.log(`Mock server running on http://localhost:${port}`);
  console.log(`Endpoint: http://localhost:${port}${endpoint}`);
  console.log(`Total establishments: ${establishmentsData.length}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

