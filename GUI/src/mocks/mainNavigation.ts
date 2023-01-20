export const mainNavigationET = [
  {
    id: 'conversations',
    label: 'Vestlus',
    path: '/vestlus',
    children: [
      {
        label: 'Vastamata',
        path: '/vestlus/vastamata',
      },
      {
        label: 'Aktiivsed',
        path: '/vestlus/aktiivsed',
      },
      {
        label: 'Ajalugu',
        path: '/vestlus/ajalugu',
      },
    ],
  },
  {
    id: 'training',
    label: 'Treening',
    path: '#',
    children: [
      {
        label: 'Treening',
        path: '#',
        children: [
          {
            label: 'Teemad',
            path: '#',
          },
          {
            label: 'Vastused',
            path: '#',
          },
          {
            label: 'Kasutuslood',
            path: '#',
          },
          {
            label: 'Konfiguratsioon',
            path: '#',
          },
          {
            label: 'Vormid',
            path: '#',
          },
          {
            label: 'Pilud',
            path: '#',
          },
        ],
      },
      {
        label: 'Ajaloolised vestlused',
        path: '#',
        children: [
          {
            label: 'Ajalugu',
            path: '#',
          },
          {
            label: 'Pöördumised',
            path: '#',
          },
        ],
      },
      {
        label: 'Mudelipank ja analüütika',
        path: '#',
        children: [
          {
            label: 'Teemade ülevaade',
            path: '#',
          },
          {
            label: 'Mudelite võrdlus',
            path: '#',
          },
          {
            label: 'Testlood',
            path: '#',
          },
        ],
      },
      {
        label: 'Treeni uus mudel',
        path: '#',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Haldus',
    path: '/haldus',
    children: [
      {
        label: 'Kasutajad',
        path: '/haldus/kasutajad',
      },
      {
        label: 'Vestlusrobot',
        path: '/haldus/vestlusrobot',
        children: [
          {
            label: 'Seaded',
            path: '/haldus/vestlusrobot/seaded',
          },
          {
            label: 'Tervitussõnum',
            path: '#',
          },
          {
            label: 'Välimus ja käitumine',
            path: '/haldus/vestlusrobot/välimus-ja-kaitumine',
          },
          {
            label: 'Erakorralised teated',
            path: '/haldus/vestlusrobot/erakorralised-teated',
          },
        ],
      },
      {
        label: 'Asutuse tööaeg',
        path: '/haldus/asutuse-tooaeg',
      },
      {
        label: 'Sessiooni pikkus',
        path: '#',
      },
    ],
  },
  {
    id: 'monitoring',
    label: 'Seire',
    path: '/seire',
    children: [],
  },
];

export const mainNavigationEN = [
  {
    id: 'conversations',
    label: 'Conversations',
    path: '/chat',
    children: [
      {
        label: 'Not responded',
        path: '/chat/not-responded',
      },
      {
        label: 'Aktiivsed',
        path: '/chat/active',
      },
      {
        label: 'Ajalugu',
        path: '/chat/history',
      },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    path: '/training',
    children: [
      {
        label: 'Training',
        path: '/training/training',
        children: [
          {
            label: 'Intents',
            path: '/training/training/intents',
          },
          {
            label: 'Responses',
            path: '/training/training/responses',
          },
          {
            label: 'Stories',
            path: '/training/training/stories',
          },
          {
            label: 'Configuration',
            path: '/training/training/configuration',
          },
          {
            label: 'Forms',
            path: '/training/training/forms',
          },
          {
            label: 'Slots',
            path: '/training/training/slots',
          },
        ],
      },
      {
        label: 'Historical conversations',
        path: '/training/historical-conversations',
        children: [
          {
            label: 'History',
            path: '/training/historical-conversations/history',
          },
          {
            label: 'Appeals',
            path: '/training/historical-conversations/appeals',
          },
        ],
      },
      {
        label: 'Model bank and analytics',
        path: '/training/model-bank-and-analytics',
        children: [
          {
            label: 'Intents overview',
            path: '/training/model-bank-and-analytics/intents-overview',
          },
          {
            label: 'Model comparison',
            path: '/training/model-bank-and-analytics/model-comparison',
          },
          {
            label: 'Testcases',
            path: '/training/model-bank-and-analytics/testcases',
          },
        ],
      },
      {
        label: 'Train new model',
        path: '/training/train-new-model',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    children: [
      {
        label: 'Users',
        path: '/settings/users',
      },
      {
        label: 'Chatbot',
        path: '/settings/chatbot',
        children: [
          {
            label: 'Settings',
            path: '/settings/chatbot/settings',
          },
          {
            label: 'Welcome message',
            path: '/settings/chatbot/welcome-message',
          },
          {
            label: 'Appearance and behaviour',
            path: '/settings/chatbot/appearance-and-behaviour',
          },
          {
            label: 'Emergency notifications',
            path: '/settings/chatbot/emergency-notifications',
          },
        ],
      },
      {
        label: 'Office opening hours',
        path: '/settings/office-opening-hours',
      },
      {
        label: 'Session length',
        path: '/settings/session-length',
      },
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    path: '/monitoring',
    children: [],
  },
];
