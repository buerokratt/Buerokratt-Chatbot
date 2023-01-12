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
    path: '/treening',
    children: [
      {
        label: 'Treening',
        path: '/treening/treening',
        children: [
          {
            label: 'Teemad',
            path: '/treening/treening/teemad',
          },
          {
            label: 'Vastused',
            path: '/treening/treening/vastused',
          },
          {
            label: 'Kasutuslood',
            path: '/treening/treening/kasutuslood',
          },
          {
            label: 'Konfiguratsioon',
            path: '/treening/treening/konfiguratsioon',
          },
          {
            label: 'Vormid',
            path: '/treening/treening/vormid',
          },
          {
            label: 'Pilud',
            path: '/treening/treening/pilud',
          },
        ],
      },
      {
        label: 'Ajaloolised vestlused',
        path: '/treening/ajaloolised-vestlused',
        children: [
          {
            label: 'Ajalugu',
            path: '/treening/ajaloolised-vestlused/ajalugu',
          },
          {
            label: 'Pöördumised',
            path: '/treening/ajaloolised-vestlused/poordumised',
          },
        ],
      },
      {
        label: 'Mudelipank ja analüütika',
        path: '/treening/mudelipank-ja-analuutika',
        children: [
          {
            label: 'Teemade ülevaade',
            path: '/treening/mudelipank-ja-analuutika/teemade-ulevaade',
          },
          {
            label: 'Mudelite võrdlus',
            path: '/treening/mudelipank-ja-analuutika/mudelite-vordlus',
          },
          {
            label: 'Testlood',
            path: '/treening/mudelipank-ja-analuutika/testlood',
          },
        ],
      },
      {
        label: 'Treeni uus mudel',
        path: '/treening/treeni-uus-mudel',
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
            path: '/haldus/vestlusrobot/tervitussõnum',
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
        path: '/haldus/sessiooni-pikkus',
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
